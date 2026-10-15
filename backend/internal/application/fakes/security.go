package fakes

import (
	"strings"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
)

// PasswordHasher e um hasher previsivel para testes: aplica um prefixo em vez
// de um algoritmo real, o que mantem os testes rapidos e deterministicos.
type PasswordHasher struct{}

// Hash devolve o "hash" da senha.
func (PasswordHasher) Hash(plain string) (string, error) { return "hashed:" + plain, nil }

// Compare confere a senha contra o hash.
func (PasswordHasher) Compare(hash, plain string) bool { return hash == "hashed:"+plain }

// TokenProvider emite tokens deterministicos para testes.
type TokenProvider struct {
	counter atomic.Int64
}

// GenerateAccessToken devolve um access token de teste.
func (t *TokenProvider) GenerateAccessToken(userID uuid.UUID) (string, int, error) {
	t.counter.Add(1)
	return "access:" + userID.String(), 900, nil
}

// GenerateRefreshToken devolve um refresh token de teste unico.
func (t *TokenProvider) GenerateRefreshToken() (string, time.Time, error) {
	t.counter.Add(1)
	return "refresh:" + uuid.NewString(), time.Now().UTC().Add(24 * time.Hour), nil
}

// HashRefreshToken deriva o hash do refresh token.
func (t *TokenProvider) HashRefreshToken(token string) string { return "hashed:" + token }

func (t *TokenProvider) SuccessorRefreshToken(previous string) string { return "next:" + previous }

// APIKeyGenerator produz chaves de API deterministicas para testes.
type APIKeyGenerator struct {
	counter int
}

// Generate devolve segredo, prefixo e hash.
func (g *APIKeyGenerator) Generate() (string, string, string, error) {
	g.counter++
	secret := "nfh_live_test" + itoa(g.counter)
	return secret, secret[:len(secret)-2] + "...", g.Hash(secret), nil
}

// Hash deriva o hash de uma chave apresentada.
func (g *APIKeyGenerator) Hash(plainKey string) string {
	return "hashed:" + strings.TrimSpace(plainKey)
}

func itoa(value int) string {
	if value == 0 {
		return "0"
	}
	digits := make([]byte, 0, 4)
	for value > 0 {
		digits = append([]byte{byte('0' + value%10)}, digits...)
		value /= 10
	}
	return string(digits)
}
