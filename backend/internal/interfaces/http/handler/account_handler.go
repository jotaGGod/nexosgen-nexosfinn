package handler

import (
	"log/slog"
	"net/http"

	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/usecase/account"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/interfaces/presenter"
)

// AccountHandler expoe o CRUD de contas financeiras.
type AccountHandler struct {
	create *account.CreateUseCase
	update *account.UpdateUseCase
	remove *account.DeleteUseCase
	list   *account.ListUseCase
	logger *slog.Logger
}

// NewAccountHandler monta o handler com seus casos de uso.
func NewAccountHandler(
	create *account.CreateUseCase,
	update *account.UpdateUseCase,
	remove *account.DeleteUseCase,
	list *account.ListUseCase,
	logger *slog.Logger,
) *AccountHandler {
	return &AccountHandler{create: create, update: update, remove: remove, list: list, logger: logger}
}

// Create cria uma conta.
func (h *AccountHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.CreateAccountInput
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

// Update altera uma conta.
func (h *AccountHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	accountID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.UpdateAccountInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.update.Execute(r.Context(), userID, accountID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Delete remove uma conta sem movimento.
func (h *AccountHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	accountID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	if err := h.remove.Execute(r.Context(), userID, accountID); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}

// List devolve as contas com seus saldos.
func (h *AccountHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.list.Execute(r.Context(), userID, queryBool(r, "include_archived"))
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.Data(w, output)
}
