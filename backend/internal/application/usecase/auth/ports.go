// Package auth reune os casos de uso de identidade: registro, login, refresh,
// logout e manutencao do perfil.
package auth

import (
	"time"

	"github.com/google/uuid"
)

// PasswordHasher abstrai o algoritmo de hash de senha.
//
// A interface e declarada aqui, junto de quem a consome, e implementada em
// internal/infrastructure/auth. E isso que permite trocar bcrypt por argon2
// sem tocar em uma linha desta camada.
type PasswordHasher interface {
	Hash(plain string) (string, error)
	Compare(hash, plain string) bool
}

// TokenProvider emite e valida os tokens da sessao web.
type TokenProvider interface {
	// GenerateAccessToken devolve o JWT e sua validade em segundos.
	GenerateAccessToken(userID uuid.UUID) (token string, expiresIn int, err error)

	// GenerateRefreshToken devolve o segredo opaco e o instante de expiracao.
	GenerateRefreshToken() (token string, expiresAt time.Time, err error)

	// HashRefreshToken deriva o hash persistido do refresh token.
	HashRefreshToken(token string) string
}
