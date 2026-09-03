package handler

import (
	"log/slog"
	"net/http"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/transaction"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

// TransactionHandler expoe o CRUD de lancamentos.
type TransactionHandler struct {
	create          *transaction.CreateUseCase
	update          *transaction.UpdateUseCase
	patchSettlement *transaction.PatchSettlementUseCase
	remove          *transaction.DeleteUseCase
	get             *transaction.GetUseCase
	list            *transaction.ListUseCase
	logger          *slog.Logger
}

// NewTransactionHandler monta o handler com seus casos de uso.
func NewTransactionHandler(
	create *transaction.CreateUseCase,
	update *transaction.UpdateUseCase,
	patchSettlement *transaction.PatchSettlementUseCase,
	remove *transaction.DeleteUseCase,
	get *transaction.GetUseCase,
	list *transaction.ListUseCase,
	logger *slog.Logger,
) *TransactionHandler {
	return &TransactionHandler{create: create, update: update, patchSettlement: patchSettlement, remove: remove, get: get, list: list, logger: logger}
}

// PatchSettlement altera exclusivamente o estado de pagamento/recebimento.
func (h *TransactionHandler) PatchSettlement(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	transactionID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	var input dto.PatchTransactionInput
	if !decodeJSON(w, r, &input) {
		return
	}
	output, err := h.patchSettlement.Execute(r.Context(), userID, transactionID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Create registra um lancamento.
func (h *TransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.CreateTransactionInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.create.Execute(r.Context(), userID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusCreated, output)
}

// Update altera um lancamento.
func (h *TransactionHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	transactionID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.UpdateTransactionInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.update.Execute(r.Context(), userID, transactionID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Delete remove um lancamento.
func (h *TransactionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	transactionID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	if err := h.remove.Execute(r.Context(), userID, transactionID); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}

// Get devolve um lancamento.
func (h *TransactionHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	transactionID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.get.Execute(r.Context(), userID, transactionID)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// List devolve a pagina de lancamentos filtrada.
func (h *TransactionHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.list.Execute(r.Context(), userID, transactionFilterFromRequest(r))
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// transactionFilterFromRequest le os filtros da query string.
// E compartilhado com o handler externo, que aceita exatamente os mesmos
// parametros.
func transactionFilterFromRequest(r *http.Request) dto.ListTransactionsInput {
	query := r.URL.Query()

	return dto.ListTransactionsInput{
		Search:      query.Get("search"),
		Type:        query.Get("type"),
		CategoryIDs: queryList(r, "category_id"),
		AccountIDs:  queryList(r, "account_id"),
		Period: dto.PeriodInput{
			StartDate: query.Get("start_date"),
			EndDate:   query.Get("end_date"),
		},
		Page:     queryInt(r, "page", 1),
		PageSize: queryInt(r, "page_size", 10),
		SortBy:   query.Get("sort_by"),
		SortDir:  query.Get("sort_dir"),
		Status:   query.Get("status"),
	}
}
