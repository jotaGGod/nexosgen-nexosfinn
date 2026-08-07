package apikey

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-financehub/backend/pkg/validator"
)

// CreateUseCase gera uma nova chave de integracao.
type CreateUseCase struct {
	keys      repository.APIKeyRepository
	generator Generator
}

// NewCreateUseCase monta o caso de uso com suas dependencias.
func NewCreateUseCase(keys repository.APIKeyRepository, generator Generator) *CreateUseCase {
	return &CreateUseCase{keys: keys, generator: generator}
}

// Execute cria a chave e devolve o segredo em texto puro.
//
// Este e o unico momento em que o segredo e conhecido pelo sistema: o que fica
// gravado e apenas o hash. Se o usuario perder a chave, a unica saida e gerar
// outra.
func (uc *CreateUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.CreateAPIKeyInput) (*dto.CreateAPIKeyOutput, error) {
	v := validator.New()
	v.Required("name", input.Name, "nome da chave").MaxLength("name", input.Name, "nome da chave", 120)
	if err := v.Error(); err != nil {
		return nil, err
	}

	scopes, err := vo.ParseScopes(input.Scopes)
	if err != nil {
		return nil, err
	}

	expiresAt, err := parseExpiration(input.ExpiresAt)
	if err != nil {
		return nil, err
	}

	plainKey, prefix, keyHash, err := uc.generator.Generate()
	if err != nil {
		return nil, domainerr.Internal("falha ao gerar a chave de API", err)
	}

	created, err := entity.NewAPIKey(userID, input.Name, prefix, keyHash, scopes, expiresAt)
	if err != nil {
		return nil, err
	}

	if err := uc.keys.Create(ctx, created); err != nil {
		return nil, err
	}

	return &dto.CreateAPIKeyOutput{
		APIKey:   dto.ToAPIKeyOutput(created, time.Now().UTC()),
		PlainKey: plainKey,
	}, nil
}

// parseExpiration aceita uma data ISO ou vazio (chave sem expiracao).
func parseExpiration(raw string) (*time.Time, error) {
	if raw == "" {
		return nil, nil
	}

	parsed, err := dto.ParseDate(raw, "data de expiracao")
	if err != nil {
		return nil, err
	}

	// A chave vale ate o fim do dia informado.
	endOfDay := parsed.Add(24*time.Hour - time.Second)
	return &endOfDay, nil
}
