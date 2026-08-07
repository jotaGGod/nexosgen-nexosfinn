package handler

import (
	"log/slog"
	"net/http"

	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/usecase/dashboard"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/interfaces/presenter"
)

// DashboardHandler expoe a tela inicial.
type DashboardHandler struct {
	get    *dashboard.GetDashboardUseCase
	logger *slog.Logger
}

// NewDashboardHandler monta o handler.
func NewDashboardHandler(get *dashboard.GetDashboardUseCase, logger *slog.Logger) *DashboardHandler {
	return &DashboardHandler{get: get, logger: logger}
}

// Get devolve resumo, graficos, lancamentos recentes e metas em uma resposta.
func (h *DashboardHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	query := r.URL.Query()
	input := dto.DashboardInput{
		Period: dto.PeriodInput{
			StartDate: query.Get("start_date"),
			EndDate:   query.Get("end_date"),
		},
		CashflowMonths: queryInt(r, "cashflow_months", 5),
		RecentLimit:    queryInt(r, "recent_limit", 5),
	}

	output, err := h.get.Execute(r.Context(), userID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}
