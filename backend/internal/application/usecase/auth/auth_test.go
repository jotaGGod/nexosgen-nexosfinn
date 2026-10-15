package auth_test

import (
	"context"
	"io"
	"log/slog"
	"sync"
	"testing"
	"time"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/fakes"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/auth"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type suite struct {
	store    *fakes.Store
	register *auth.RegisterUseCase
	login    *auth.LoginUseCase
	refresh  *auth.RefreshUseCase
	logout   *auth.LogoutUseCase
}

func newSuite() *suite {
	store := fakes.NewStore()
	hasher := fakes.PasswordHasher{}
	tokens := &fakes.TokenProvider{}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	return &suite{
		store: store,
		register: auth.NewRegisterUseCase(
			store.UserRepo(), store.CategoryRepo(), store.AccountRepo(),
			store.RefreshTokenRepo(), hasher, tokens, logger,
		),
		login:   auth.NewLoginUseCase(store.UserRepo(), store.RefreshTokenRepo(), hasher, tokens),
		refresh: auth.NewRefreshUseCase(store.UserRepo(), store.RefreshTokenRepo(), tokens),
		logout:  auth.NewLogoutUseCase(store.RefreshTokenRepo(), tokens),
	}
}

func validRegistration() dto.RegisterInput {
	return dto.RegisterInput{Name: "Joao Silva", Email: "joao@email.com", Password: "senha-segura"}
}

func TestRegisterAbreSessaoEsemeiaEspacoDeTrabalho(t *testing.T) {
	s := newSuite()

	output, err := s.register.Execute(context.Background(), validRegistration())
	require.NoError(t, err)

	assert.NotEmpty(t, output.AccessToken)
	assert.NotEmpty(t, output.RefreshToken)
	assert.Equal(t, "joao@email.com", output.User.Email)

	assert.NotEmpty(t, s.store.Categories, "o usuario deve comecar com categorias padrao")
	assert.Len(t, s.store.Accounts, 1, "o usuario deve comecar com uma conta padrao")
}

func TestRegisterRejeitaEmailDuplicado(t *testing.T) {
	s := newSuite()
	ctx := context.Background()

	_, err := s.register.Execute(ctx, validRegistration())
	require.NoError(t, err)

	duplicated := validRegistration()
	duplicated.Email = "JOAO@email.com" // o e-mail e normalizado antes da checagem

	_, err = s.register.Execute(ctx, duplicated)
	require.Error(t, err)
	assert.Equal(t, domainerr.KindConflict, domainerr.KindOf(err))
}

func TestRegisterExigeSenhaMinima(t *testing.T) {
	s := newSuite()

	input := validRegistration()
	input.Password = "1234"

	_, err := s.register.Execute(context.Background(), input)
	require.Error(t, err)

	domainError, ok := domainerr.As(err)
	require.True(t, ok)
	assert.Equal(t, domainerr.KindInvalidInput, domainError.Kind)
	assert.Contains(t, domainError.Fields, "password")
}

func TestLogin(t *testing.T) {
	s := newSuite()
	ctx := context.Background()
	require.NoError(t, firstError(s.register.Execute(ctx, validRegistration())))

	output, err := s.login.Execute(ctx, dto.LoginInput{Email: "joao@email.com", Password: "senha-segura"})
	require.NoError(t, err)
	assert.NotEmpty(t, output.AccessToken)
}

func TestLoginNaoRevelaSeOEmailExiste(t *testing.T) {
	s := newSuite()
	ctx := context.Background()
	require.NoError(t, firstError(s.register.Execute(ctx, validRegistration())))

	_, wrongPassword := s.login.Execute(ctx, dto.LoginInput{Email: "joao@email.com", Password: "errada"})
	_, unknownEmail := s.login.Execute(ctx, dto.LoginInput{Email: "ninguem@email.com", Password: "errada"})

	require.Error(t, wrongPassword)
	require.Error(t, unknownEmail)

	first, _ := domainerr.As(wrongPassword)
	second, _ := domainerr.As(unknownEmail)
	assert.Equal(t, first.Code, second.Code, "as duas falhas devem ser indistinguiveis")
	assert.Equal(t, domainerr.KindUnauthorized, first.Kind)
}

func TestRefreshRotacionaOToken(t *testing.T) {
	s := newSuite()
	ctx := context.Background()

	session, err := s.register.Execute(ctx, validRegistration())
	require.NoError(t, err)

	renewed, err := s.refresh.Execute(ctx, dto.RefreshInput{RefreshToken: session.RefreshToken})
	require.NoError(t, err)
	assert.NotEqual(t, session.RefreshToken, renewed.RefreshToken)

	// Requisições simultâneas reutilizam o mesmo sucessor sem criar sessões extras.
	concurrent, err := s.refresh.Execute(ctx, dto.RefreshInput{RefreshToken: session.RefreshToken})
	require.NoError(t, err)
	assert.Equal(t, renewed.RefreshToken, concurrent.RefreshToken)
	assert.Len(t, s.store.RefreshTokens, 2)

	// A janela de concorrência é curta e não permite reuso indefinido.
	old := time.Now().UTC().Add(-time.Minute)
	s.store.RefreshTokens[0].RevokedAt = &old
	_, err = s.refresh.Execute(ctx, dto.RefreshInput{RefreshToken: session.RefreshToken})
	require.Error(t, err)
	assert.Equal(t, domainerr.KindUnauthorized, domainerr.KindOf(err))
}

func TestRefreshConcorrenteMantemUmaUnicaSessaoSucessora(t *testing.T) {
	s := newSuite()
	ctx := context.Background()
	session, err := s.register.Execute(ctx, validRegistration())
	require.NoError(t, err)
	const requests = 12
	results := make(chan *dto.AuthOutput, requests)
	errors := make(chan error, requests)
	var group sync.WaitGroup
	for i := 0; i < requests; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			result, err := s.refresh.Execute(ctx, dto.RefreshInput{RefreshToken: session.RefreshToken})
			results <- result
			errors <- err
		}()
	}
	group.Wait()
	close(results)
	close(errors)
	for err := range errors {
		require.NoError(t, err)
	}
	var successor string
	for result := range results {
		if successor == "" {
			successor = result.RefreshToken
		}
		assert.Equal(t, successor, result.RefreshToken)
	}
	assert.Len(t, s.store.RefreshTokens, 2)
}

func TestLogoutInvalidaSucessorSemAfetarOutroDispositivo(t *testing.T) {
	s := newSuite()
	ctx := context.Background()
	first, err := s.register.Execute(ctx, validRegistration())
	require.NoError(t, err)
	second, err := s.login.Execute(ctx, dto.LoginInput{Email: validRegistration().Email, Password: validRegistration().Password})
	require.NoError(t, err)
	renewed, err := s.refresh.Execute(ctx, dto.RefreshInput{RefreshToken: first.RefreshToken})
	require.NoError(t, err)
	require.NoError(t, s.logout.Execute(ctx, dto.RefreshInput{RefreshToken: first.RefreshToken}))
	for _, token := range []string{first.RefreshToken, renewed.RefreshToken} {
		_, err := s.refresh.Execute(ctx, dto.RefreshInput{RefreshToken: token})
		require.Error(t, err)
		assert.Equal(t, domainerr.KindUnauthorized, domainerr.KindOf(err))
	}
	_, err = s.refresh.Execute(ctx, dto.RefreshInput{RefreshToken: second.RefreshToken})
	require.NoError(t, err)
}

func TestLogoutComTokenDesconhecidoNaoFalha(t *testing.T) {
	s := newSuite()

	err := s.logout.Execute(context.Background(), dto.RefreshInput{RefreshToken: "inexistente"})
	assert.NoError(t, err, "sair sem sessao valida ja satisfaz a intencao do usuario")
}

func firstError(_ *dto.AuthOutput, err error) error { return err }
