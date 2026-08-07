package apikey_test

import (
	"context"
	"io"
	"log/slog"
	"testing"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/fakes"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/apikey"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fixture struct {
	store        *fakes.Store
	userID       uuid.UUID
	create       *apikey.CreateUseCase
	list         *apikey.ListUseCase
	revoke       *apikey.RevokeUseCase
	authenticate *apikey.AuthenticateUseCase
}

func newFixture() *fixture {
	store := fakes.NewStore()
	generator := &fakes.APIKeyGenerator{}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	return &fixture{
		store:        store,
		userID:       uuid.New(),
		create:       apikey.NewCreateUseCase(store.APIKeyRepo(), generator),
		list:         apikey.NewListUseCase(store.APIKeyRepo()),
		revoke:       apikey.NewRevokeUseCase(store.APIKeyRepo()),
		authenticate: apikey.NewAuthenticateUseCase(store.APIKeyRepo(), generator, logger),
	}
}

func TestCreateDevolveOSegredoUmaUnicaVez(t *testing.T) {
	f := newFixture()

	created, err := f.create.Execute(context.Background(), f.userID, dto.CreateAPIKeyInput{Name: "n8n WhatsApp"})
	require.NoError(t, err)

	assert.NotEmpty(t, created.PlainKey, "o segredo so existe nesta resposta")
	assert.NotEmpty(t, created.APIKey.Prefix)
	assert.Equal(t, "active", created.APIKey.Status)
	assert.ElementsMatch(t, vo.ScopesToStrings(vo.AllScopes()), created.APIKey.Scopes)

	// A chave em texto puro nao pode ser recuperada pela listagem.
	listed, err := f.list.Execute(context.Background(), f.userID)
	require.NoError(t, err)
	require.Len(t, listed, 1)
	assert.NotContains(t, listed[0].Prefix, created.PlainKey)
}

func TestCreateComEscoposEspecificos(t *testing.T) {
	f := newFixture()

	created, err := f.create.Execute(context.Background(), f.userID, dto.CreateAPIKeyInput{
		Name:   "somente leitura",
		Scopes: []string{"read:balance"},
	})
	require.NoError(t, err)
	assert.Equal(t, []string{"read:balance"}, created.APIKey.Scopes)
}

func TestCreateRejeitaEscopoDesconhecido(t *testing.T) {
	f := newFixture()

	_, err := f.create.Execute(context.Background(), f.userID, dto.CreateAPIKeyInput{
		Name:   "chave",
		Scopes: []string{"drop:database"},
	})
	require.Error(t, err)
	assert.Equal(t, domainerr.KindInvalidInput, domainerr.KindOf(err))
}

func TestAuthenticate(t *testing.T) {
	f := newFixture()
	ctx := context.Background()

	created, err := f.create.Execute(ctx, f.userID, dto.CreateAPIKeyInput{Name: "n8n"})
	require.NoError(t, err)

	identity, err := f.authenticate.Execute(ctx, created.PlainKey)
	require.NoError(t, err)

	assert.Equal(t, f.userID, identity.UserID)
	assert.True(t, identity.HasScope(vo.ScopeWriteTransactions))
}

func TestAuthenticateRejeitaChaveInvalidaOuRevogada(t *testing.T) {
	f := newFixture()
	ctx := context.Background()

	created, err := f.create.Execute(ctx, f.userID, dto.CreateAPIKeyInput{Name: "n8n"})
	require.NoError(t, err)

	_, err = f.authenticate.Execute(ctx, "nfh_live_inexistente")
	require.Error(t, err)
	assert.Equal(t, domainerr.KindUnauthorized, domainerr.KindOf(err))

	_, err = f.authenticate.Execute(ctx, "")
	require.Error(t, err)
	assert.Equal(t, domainerr.KindUnauthorized, domainerr.KindOf(err))

	require.NoError(t, f.revoke.Execute(ctx, f.userID, uuid.MustParse(created.APIKey.ID)))

	_, err = f.authenticate.Execute(ctx, created.PlainKey)
	require.Error(t, err)
	assert.Equal(t, domainerr.KindUnauthorized, domainerr.KindOf(err))
}

func TestRevokeNaoAlcancaChaveDeOutroUsuario(t *testing.T) {
	f := newFixture()
	ctx := context.Background()

	created, err := f.create.Execute(ctx, f.userID, dto.CreateAPIKeyInput{Name: "n8n"})
	require.NoError(t, err)

	err = f.revoke.Execute(ctx, uuid.New(), uuid.MustParse(created.APIKey.ID))
	require.Error(t, err)
	assert.Equal(t, domainerr.KindNotFound, domainerr.KindOf(err))
}
