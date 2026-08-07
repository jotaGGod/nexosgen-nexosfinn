package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
)

// WorkspaceRepository executa operacoes atomicas que envolvem todo o espaco
// financeiro de um usuario.
type WorkspaceRepository interface {
	Reset(ctx context.Context, userID uuid.UUID, categories []*entity.Category, account *entity.Account) error
}
