package valueobject_test

import (
	"testing"

	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseScopesListaVaziaRecebeTodos(t *testing.T) {
	scopes, err := vo.ParseScopes(nil)
	require.NoError(t, err)
	assert.ElementsMatch(t, vo.AllScopes(), scopes)
}

func TestParseScopesRemoveDuplicatas(t *testing.T) {
	scopes, err := vo.ParseScopes([]string{"read:transactions", "read:transactions", "read:balance"})
	require.NoError(t, err)
	assert.Equal(t, []vo.Scope{vo.ScopeReadTransactions, vo.ScopeReadBalance}, scopes)
}

func TestParseScopesRejeitaDesconhecido(t *testing.T) {
	_, err := vo.ParseScopes([]string{"delete:everything"})
	assert.Error(t, err)
}
