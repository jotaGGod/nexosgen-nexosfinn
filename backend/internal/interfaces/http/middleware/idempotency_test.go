package middleware

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

type memoryIdempotencyRecord struct {
	hash, method, path string
	complete           bool
	status             int
	body               []byte
}

type memoryIdempotencyStore struct {
	mu      sync.Mutex
	records map[string]*memoryIdempotencyRecord
}

func (s *memoryIdempotencyStore) Claim(_ context.Context, userID uuid.UUID, key, hash, method, path string) (IdempotencyClaim, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	storageKey := userID.String() + ":" + key
	record := s.records[storageKey]
	if record == nil {
		s.records[storageKey] = &memoryIdempotencyRecord{hash: hash, method: method, path: path}
		return IdempotencyClaim{Claimed: true}, nil
	}
	if record.hash != hash || record.method != method || record.path != path {
		return IdempotencyClaim{}, &conflictError{}
	}
	if record.complete {
		return IdempotencyClaim{Complete: true, StatusCode: record.status, ResponseBody: record.body}, nil
	}
	return IdempotencyClaim{}, nil
}

func (s *memoryIdempotencyStore) Complete(_ context.Context, userID uuid.UUID, key string, status int, body []byte) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	record := s.records[userID.String()+":"+key]
	record.complete, record.status, record.body = true, status, append([]byte(nil), body...)
	return nil
}

type conflictError struct{}

func (*conflictError) Error() string { return "conflict" }

func TestIdempotencyReplaysACompletedMutationWithoutCallingHandlerAgain(t *testing.T) {
	store := &memoryIdempotencyStore{records: map[string]*memoryIdempotencyRecord{}}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	userID := uuid.New()
	calls := 0
	handler := Idempotency(store, logger)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		calls++
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_, _ = w.Write([]byte(`{"id":"created-once"}`))
	}))

	request := func(body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/external/transactions", strings.NewReader(body))
		req.Header.Set("Idempotency-Key", "same-key")
		req = req.WithContext(WithUserID(req.Context(), userID))
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, req)
		return response
	}

	first := request(`{"amount":10}`)
	second := request(`{"amount":10}`)
	require.Equal(t, http.StatusCreated, first.Code)
	require.Equal(t, http.StatusCreated, second.Code)
	require.Equal(t, first.Body.String(), second.Body.String())
	require.Equal(t, "true", second.Header().Get("Idempotency-Replayed"))
	require.Equal(t, 1, calls)
}

func TestIdempotencyRequiresAKey(t *testing.T) {
	store := &memoryIdempotencyStore{records: map[string]*memoryIdempotencyRecord{}}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	handler := Idempotency(store, logger)(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("handler must not run")
	}))
	req := httptest.NewRequest(http.MethodPost, "/api/v1/external/transactions", nil)
	req = req.WithContext(WithUserID(req.Context(), uuid.New()))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	require.Equal(t, http.StatusUnprocessableEntity, response.Code)
}
