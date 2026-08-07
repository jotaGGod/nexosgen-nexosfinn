package entity_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newAPIKey(t *testing.T, scopes []vo.Scope, expiresAt *time.Time) *entity.APIKey {
	t.Helper()

	key, err := entity.NewAPIKey(uuid.New(), "n8n WhatsApp", "nfh_live_ab12cdef", "hash", scopes, expiresAt)
	require.NoError(t, err)
	return key
}

func TestNewAPIKeySemEscopoRecebeTodos(t *testing.T) {
	key := newAPIKey(t, nil, nil)
	assert.ElementsMatch(t, vo.AllScopes(), key.Scopes)
}

func TestAPIKeyHasScope(t *testing.T) {
	key := newAPIKey(t, []vo.Scope{vo.ScopeReadBalance}, nil)

	assert.True(t, key.HasScope(vo.ScopeReadBalance))
	assert.False(t, key.HasScope(vo.ScopeWriteTransactions),
		"uma chave somente-leitura nao pode escrever transacoes")
}

func TestAPIKeyRevoke(t *testing.T) {
	key := newAPIKey(t, nil, nil)
	now := time.Now().UTC()

	require.NoError(t, key.Revoke(now))
	assert.False(t, key.IsActive(now))
	assert.Equal(t, "revoked", key.Status(now))

	assert.Error(t, key.Revoke(now), "revogar duas vezes deve conflitar")
}

func TestAPIKeyExpiracao(t *testing.T) {
	future := time.Now().UTC().Add(24 * time.Hour)
	key := newAPIKey(t, nil, &future)

	assert.True(t, key.IsActive(time.Now().UTC()))
	assert.False(t, key.IsActive(future.Add(time.Minute)))
	assert.Equal(t, "expired", key.Status(future.Add(time.Minute)))
}

func TestNewAPIKeyRejeitaExpiracaoNoPassado(t *testing.T) {
	past := time.Now().UTC().Add(-time.Hour)
	_, err := entity.NewAPIKey(uuid.New(), "chave", "nfh_live_x", "hash", nil, &past)
	assert.Error(t, err)
}
