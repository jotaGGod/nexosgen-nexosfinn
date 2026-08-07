package handler

import (
	"log/slog"
	"net/http"

	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/usecase/goal"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/interfaces/presenter"
)

// GoalHandler expoe o CRUD de metas financeiras.
type GoalHandler struct {
	create     *goal.CreateUseCase
	update     *goal.UpdateUseCase
	remove     *goal.DeleteUseCase
	list       *goal.ListUseCase
	contribute *goal.ContributeUseCase
	logger     *slog.Logger
}

// NewGoalHandler monta o handler com seus casos de uso.
func NewGoalHandler(
	create *goal.CreateUseCase,
	update *goal.UpdateUseCase,
	remove *goal.DeleteUseCase,
	list *goal.ListUseCase,
	contribute *goal.ContributeUseCase,
	logger *slog.Logger,
) *GoalHandler {
	return &GoalHandler{
		create:     create,
		update:     update,
		remove:     remove,
		list:       list,
		contribute: contribute,
		logger:     logger,
	}
}

// Create cria uma meta.
func (h *GoalHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.CreateGoalInput
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

// Update altera uma meta.
func (h *GoalHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	goalID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.UpdateGoalInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.update.Execute(r.Context(), userID, goalID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Delete remove uma meta.
func (h *GoalHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	goalID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	if err := h.remove.Execute(r.Context(), userID, goalID); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}

// List devolve as metas com o progresso calculado.
func (h *GoalHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.list.Execute(r.Context(), userID, r.URL.Query().Get("filter"), queryBool(r, "include_archived"))
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.Data(w, output)
}

// Contribute registra um aporte na meta.
func (h *GoalHandler) Contribute(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	goalID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.ContributeGoalInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.contribute.Execute(r.Context(), userID, goalID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}
