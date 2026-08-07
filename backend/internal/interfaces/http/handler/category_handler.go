package handler

import (
	"log/slog"
	"net/http"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/category"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

// CategoryHandler expoe o CRUD de categorias.
type CategoryHandler struct {
	create *category.CreateUseCase
	update *category.UpdateUseCase
	remove *category.DeleteUseCase
	list   *category.ListUseCase
	logger *slog.Logger
}

// NewCategoryHandler monta o handler com seus casos de uso.
func NewCategoryHandler(
	create *category.CreateUseCase,
	update *category.UpdateUseCase,
	remove *category.DeleteUseCase,
	list *category.ListUseCase,
	logger *slog.Logger,
) *CategoryHandler {
	return &CategoryHandler{create: create, update: update, remove: remove, list: list, logger: logger}
}

// Create cria uma categoria.
func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.CreateCategoryInput
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

// Update altera uma categoria.
func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	categoryID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.UpdateCategoryInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.update.Execute(r.Context(), userID, categoryID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Delete remove uma categoria sem uso.
func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	categoryID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	if err := h.remove.Execute(r.Context(), userID, categoryID); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}

// List devolve as categorias do usuario.
func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.list.Execute(r.Context(), userID, r.URL.Query().Get("type"), queryBool(r, "include_archived"))
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.Data(w, output)
}
