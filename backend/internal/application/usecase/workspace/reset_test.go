package workspace_test

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/usecase/workspace"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type resetRepositorySpy struct {
	userID     uuid.UUID
	categories []*entity.Category
	account    *entity.Account
	err        error
}

func (s *resetRepositorySpy) Reset(
	_ context.Context,
	userID uuid.UUID,
	categories []*entity.Category,
	account *entity.Account,
) error {
	s.userID = userID
	s.categories = categories
	s.account = account
	return s.err
}

func TestResetRecriaEspacoFinanceiroPadrao(t *testing.T) {
	repository := &resetRepositorySpy{}
	useCase := workspace.NewResetUseCase(repository)
	userID := uuid.New()

	require.NoError(t, useCase.Execute(context.Background(), userID))

	assert.Equal(t, userID, repository.userID)
	assert.Len(t, repository.categories, 10)
	assert.Equal(t, userID, repository.account.UserID)
	assert.Equal(t, "Conta Corrente", repository.account.Name)
	assert.True(t, repository.account.InitialBalance.IsZero())

	for _, category := range repository.categories {
		assert.Equal(t, userID, category.UserID)
	}
}

func TestResetPropagaFalhaAtomicaDoRepositorio(t *testing.T) {
	expected := errors.New("reset failed")
	repository := &resetRepositorySpy{err: expected}
	useCase := workspace.NewResetUseCase(repository)

	err := useCase.Execute(context.Background(), uuid.New())

	assert.ErrorIs(t, err, expected)
}
