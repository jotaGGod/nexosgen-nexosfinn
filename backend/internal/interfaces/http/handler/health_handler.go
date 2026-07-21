package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/jacks/finapp/backend/internal/interfaces/presenter"
)

// Pinger reporta a disponibilidade de uma dependencia externa.
type Pinger interface {
	Ping(ctx context.Context) error
}

// HealthHandler responde as sondas de disponibilidade.
type HealthHandler struct {
	db Pinger
}

// NewHealthHandler monta o handler.
func NewHealthHandler(db Pinger) *HealthHandler {
	return &HealthHandler{db: db}
}

// Live responde que o processo esta de pe.
func (h *HealthHandler) Live(w http.ResponseWriter, r *http.Request) {
	presenter.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// Ready so responde 200 quando o banco tambem responde — e o sinal que o
// Docker Compose usa para liberar o frontend.
func (h *HealthHandler) Ready(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if err := h.db.Ping(ctx); err != nil {
		presenter.JSON(w, http.StatusServiceUnavailable, map[string]string{
			"status": "unavailable",
			"reason": "banco de dados indisponivel",
		})
		return
	}

	presenter.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
