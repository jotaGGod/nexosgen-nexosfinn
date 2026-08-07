package middleware

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/interfaces/presenter"
)

// RequestID atribui (ou reaproveita) um identificador por requisicao,
// permitindo correlacionar os logs de uma mesma chamada.
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-ID")
		if requestID == "" {
			requestID = uuid.NewString()
		}

		w.Header().Set("X-Request-ID", requestID)
		next.ServeHTTP(w, r.WithContext(WithRequestID(r.Context(), requestID)))
	})
}

// statusRecorder captura o status escrito pelo handler.
type statusRecorder struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func (r *statusRecorder) Write(payload []byte) (int, error) {
	if r.status == 0 {
		r.status = http.StatusOK
	}
	written, err := r.ResponseWriter.Write(payload)
	r.bytes += written
	return written, err
}

// Logger registra cada requisicao com metodo, rota, status e duracao.
func Logger(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}

			next.ServeHTTP(recorder, r)

			logger.InfoContext(r.Context(), "requisicao HTTP",
				slog.String("request_id", RequestIDFrom(r.Context())),
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", recorder.status),
				slog.Int("bytes", recorder.bytes),
				slog.Duration("duration", time.Since(start)),
			)
		})
	}
}

// Recover impede que um panico derrube o processo, respondendo 500 e
// registrando o incidente.
func Recover(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if recovered := recover(); recovered != nil {
					logger.ErrorContext(r.Context(), "panico durante a requisicao",
						slog.String("request_id", RequestIDFrom(r.Context())),
						slog.String("path", r.URL.Path),
						slog.Any("panic", recovered),
					)

					presenter.Error(r.Context(), w, logger,
						domainerr.Internal("erro inesperado", nil))
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}
