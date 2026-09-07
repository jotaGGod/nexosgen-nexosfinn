package middleware

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"log/slog"
	"net/http"
	"strings"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

type IdempotencyClaim struct {
	Claimed      bool
	Complete     bool
	StatusCode   int
	ResponseBody []byte
}

type IdempotencyStore interface {
	Claim(ctx context.Context, userID uuid.UUID, key, requestHash, method, path string) (IdempotencyClaim, error)
	Complete(ctx context.Context, userID uuid.UUID, key string, statusCode int, responseBody []byte) error
}

func Idempotency(store IdempotencyStore, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := strings.TrimSpace(r.Header.Get("Idempotency-Key"))
			if key == "" || len(key) > 200 {
				presenter.Error(r.Context(), w, logger, domainerr.InvalidInput("idempotency_key_required", "informe um Idempotency-Key válido"))
				return
			}
			userID, ok := UserID(r.Context())
			if !ok {
				presenter.Error(r.Context(), w, logger, domainerr.Unauthorized("authentication_required", "autenticação necessária"))
				return
			}
			body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
			if err != nil {
				presenter.Error(r.Context(), w, logger, domainerr.InvalidInput("invalid_body", "corpo inválido"))
				return
			}
			r.Body = io.NopCloser(bytes.NewReader(body))
			sum := sha256.Sum256(append([]byte(r.Method+"\n"+r.URL.Path+"\n"), body...))
			claim, err := store.Claim(r.Context(), userID, key, hex.EncodeToString(sum[:]), r.Method, r.URL.Path)
			if err != nil {
				presenter.Error(r.Context(), w, logger, err)
				return
			}
			if claim.Complete {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Idempotency-Replayed", "true")
				w.WriteHeader(claim.StatusCode)
				_, _ = w.Write(claim.ResponseBody)
				return
			}
			if !claim.Claimed {
				presenter.Error(r.Context(), w, logger, domainerr.Conflict("idempotency_in_progress", "uma requisição com esta chave ainda está em processamento"))
				return
			}

			recorder := &idempotencyResponseRecorder{header: make(http.Header), statusCode: http.StatusOK}
			next.ServeHTTP(recorder, r)
			if err := store.Complete(r.Context(), userID, key, recorder.statusCode, recorder.body.Bytes()); err != nil {
				presenter.Error(r.Context(), w, logger, err)
				return
			}
			for name, values := range recorder.header {
				for _, value := range values {
					w.Header().Add(name, value)
				}
			}
			w.WriteHeader(recorder.statusCode)
			_, _ = w.Write(recorder.body.Bytes())
		})
	}
}

type idempotencyResponseRecorder struct {
	header      http.Header
	body        bytes.Buffer
	statusCode  int
	wroteHeader bool
}

func (r *idempotencyResponseRecorder) Header() http.Header { return r.header }
func (r *idempotencyResponseRecorder) WriteHeader(statusCode int) {
	if r.wroteHeader {
		return
	}
	r.statusCode = statusCode
	r.wroteHeader = true
}
func (r *idempotencyResponseRecorder) Write(body []byte) (int, error) {
	if !r.wroteHeader {
		r.WriteHeader(http.StatusOK)
	}
	return r.body.Write(body)
}
