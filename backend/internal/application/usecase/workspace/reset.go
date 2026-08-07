// Package workspace reune operacoes que afetam o espaco financeiro inteiro.
package workspace

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
)

// ResetUseCase apaga os dados financeiros e recria o espaco inicial, sem
// alterar a identidade, as sessoes ou as integracoes do usuario.
type ResetUseCase struct {
	workspace repository.WorkspaceRepository
}

// NewResetUseCase monta o caso de uso.
func NewResetUseCase(workspace repository.WorkspaceRepository) *ResetUseCase {
	return &ResetUseCase{workspace: workspace}
}

// Execute recomeca o espaco financeiro em uma unica operacao atomica.
func (uc *ResetUseCase) Execute(ctx context.Context, userID uuid.UUID) error {
	categories, account, err := service.NewDefaultWorkspace(userID)
	if err != nil {
		return err
	}

	return uc.workspace.Reset(ctx, userID, categories, account)
}
