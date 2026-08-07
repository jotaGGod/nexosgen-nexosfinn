package handler

import (
	"log/slog"
	"net/http"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/auth"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/workspace"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

// AuthHandler expoe os endpoints de identidade.
type AuthHandler struct {
	register       *auth.RegisterUseCase
	login          *auth.LoginUseCase
	refresh        *auth.RefreshUseCase
	logout         *auth.LogoutUseCase
	profile        *auth.GetProfileUseCase
	updateProfile  *auth.UpdateProfileUseCase
	changePassword *auth.ChangePasswordUseCase
	resetWorkspace *workspace.ResetUseCase
	logger         *slog.Logger
}

// NewAuthHandler monta o handler com seus casos de uso.
func NewAuthHandler(
	register *auth.RegisterUseCase,
	login *auth.LoginUseCase,
	refresh *auth.RefreshUseCase,
	logout *auth.LogoutUseCase,
	profile *auth.GetProfileUseCase,
	updateProfile *auth.UpdateProfileUseCase,
	changePassword *auth.ChangePasswordUseCase,
	resetWorkspace *workspace.ResetUseCase,
	logger *slog.Logger,
) *AuthHandler {
	return &AuthHandler{
		register:       register,
		login:          login,
		refresh:        refresh,
		logout:         logout,
		profile:        profile,
		updateProfile:  updateProfile,
		changePassword: changePassword,
		resetWorkspace: resetWorkspace,
		logger:         logger,
	}
}

// Register cria a conta e ja devolve a sessao.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input dto.RegisterInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.register.Execute(r.Context(), input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusCreated, output)
}

// Login autentica o usuario.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input dto.LoginInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.login.Execute(r.Context(), input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Refresh troca o refresh token por uma nova sessao.
func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var input dto.RefreshInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.refresh.Execute(r.Context(), input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// Logout encerra a sessao.
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var input dto.RefreshInput
	if !decodeJSON(w, r, &input) {
		return
	}

	if err := h.logout.Execute(r.Context(), input); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}

// Me devolve o perfil do usuario autenticado.
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.profile.Execute(r.Context(), userID)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// UpdateProfile altera nome e e-mail.
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.UpdateProfileInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.updateProfile.Execute(r.Context(), userID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusOK, output)
}

// ChangePassword troca a senha do usuario.
func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.ChangePasswordInput
	if !decodeJSON(w, r, &input) {
		return
	}

	if err := h.changePassword.Execute(r.Context(), userID, input); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}

// ResetFinancialData apaga o espaco financeiro e recria os dados iniciais.
func (h *AuthHandler) ResetFinancialData(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	if err := h.resetWorkspace.Execute(r.Context(), userID); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}
