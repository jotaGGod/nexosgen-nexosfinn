package handler

import (
	"log/slog"
	"net/http"

	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/application/usecase/budget"
	"github.com/jacks/finapp/backend/internal/interfaces/presenter"
)

// BudgetHandler expoe os orcamentos mensais por categoria.
type BudgetHandler struct {
	upsert *budget.UpsertUseCase
	list   *budget.ListUseCase
	remove *budget.DeleteUseCase
	logger *slog.Logger
}

// NewBudgetHandler monta o handler com seus casos de uso.
func NewBudgetHandler(
	upsert *budget.UpsertUseCase,
	list *budget.ListUseCase,
	remove *budget.DeleteUseCase,
	logger *slog.Logger,
) *BudgetHandler {
	return &BudgetHandler{upsert: upsert, list: list, remove: remove, logger: logger}
}

// Upsert define ou atualiza o limite de uma categoria no mes.
func (h *BudgetHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.UpsertBudgetInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.upsert.Execute(r.Context(), userID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// List devolve os orcamentos do mes com o consumo apurado.
func (h *BudgetHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.list.Execute(r.Context(), userID, dto.ListBudgetsInput{Month: r.URL.Query().Get("month")})
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Delete remove um orcamento.
func (h *BudgetHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	budgetID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	if err := h.remove.Execute(r.Context(), userID, budgetID); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}
