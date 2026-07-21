package handler

import (
	"log/slog"
	"net/http"

	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/application/usecase/report"
	"github.com/jacks/finapp/backend/internal/interfaces/presenter"
)

// ReportHandler expoe a tela de relatorios.
type ReportHandler struct {
	get    *report.GetReportUseCase
	logger *slog.Logger
}

// NewReportHandler monta o handler.
func NewReportHandler(get *report.GetReportUseCase, logger *slog.Logger) *ReportHandler {
	return &ReportHandler{get: get, logger: logger}
}

// Get devolve visao geral, fluxo de caixa, categorias, tendencias e insights.
func (h *ReportHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	query := r.URL.Query()
	input := dto.ReportInput{
		Period: dto.PeriodInput{
			StartDate: query.Get("start_date"),
			EndDate:   query.Get("end_date"),
		},
		TrendMonths: queryInt(r, "trend_months", 6),
	}

	output, err := h.get.Execute(r.Context(), userID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}
