package auth_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
	"github.com/jacks/finapp/backend/internal/infrastructure/auth"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testSecret = "um-segredo-de-teste-com-mais-de-32-caracteres"

func TestAccessTokenIdaEVolta(t *testing.T) {
	provider := auth.NewJWTProvider(testSecret, 15*time.Minute, time.Hour)
	userID := uuid.New()

	token, expiresIn, err := provider.GenerateAccessToken(userID)
	require.NoError(t, err)
	assert.Equal(t, 900, expiresIn)

	parsed, err := provider.ParseAccessToken(token)
	require.NoError(t, err)
	assert.Equal(t, userID, parsed)
}

func TestParseAccessTokenRejeitaOutroSegredo(t *testing.T) {
	issuer := auth.NewJWTProvider(testSecret, 15*time.Minute, time.Hour)
	attacker := auth.NewJWTProvider("outro-segredo-com-mais-de-32-caracteres!!", 15*time.Minute, time.Hour)

	token, _, err := attacker.GenerateAccessToken(uuid.New())
	require.NoError(t, err)

	_, err = issuer.ParseAccessToken(token)
	require.Error(t, err)
	assert.Equal(t, domainerr.KindUnauthorized, domainerr.KindOf(err))
}

func TestParseAccessTokenRejeitaExpirado(t *testing.T) {
	provider := auth.NewJWTProvider(testSecret, -time.Minute, time.Hour)

	token, _, err := provider.GenerateAccessToken(uuid.New())
	require.NoError(t, err)

	_, err = provider.ParseAccessToken(token)
	assert.Error(t, err)
}

func TestParseAccessTokenRejeitaLixo(t *testing.T) {
	provider := auth.NewJWTProvider(testSecret, 15*time.Minute, time.Hour)

	_, err := provider.ParseAccessToken("nao-e-um-jwt")
	assert.Error(t, err)
}

func TestRefreshTokenEhUnicoEHashavel(t *testing.T) {
	provider := auth.NewJWTProvider(testSecret, 15*time.Minute, 24*time.Hour)

	first, expiresAt, err := provider.GenerateRefreshToken()
	require.NoError(t, err)
	second, _, err := provider.GenerateRefreshToken()
	require.NoError(t, err)

	assert.NotEqual(t, first, second)
	assert.True(t, expiresAt.After(time.Now().UTC()))
	assert.Equal(t, provider.HashRefreshToken(first), provider.HashRefreshToken(first))
	assert.NotEqual(t, first, provider.HashRefreshToken(first), "o token nunca e persistido em texto puro")
}

func TestBcryptHasher(t *testing.T) {
	hasher := auth.NewBcryptHasher(4) // custo baixo mantem o teste rapido

	hash, err := hasher.Hash("senha-segura")
	require.NoError(t, err)

	assert.NotEqual(t, "senha-segura", hash)
	assert.True(t, hasher.Compare(hash, "senha-segura"))
	assert.False(t, hasher.Compare(hash, "senha-errada"))
}
