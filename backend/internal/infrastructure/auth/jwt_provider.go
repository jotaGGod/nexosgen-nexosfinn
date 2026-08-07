// Package auth implementa os servicos criptograficos da autenticacao:
// emissao e validacao de JWT, geracao de refresh tokens e hash de senha.
package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
)

// JWTProvider emite e valida os tokens da sessao web.
type JWTProvider struct {
	secret     []byte
	accessTTL  time.Duration
	refreshTTL time.Duration
	issuer     string
}

// NewJWTProvider cria o provedor de tokens.
func NewJWTProvider(secret string, accessTTL, refreshTTL time.Duration) *JWTProvider {
	return &JWTProvider{
		secret:     []byte(secret),
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
		issuer:     "nexosgen-nexosfinn",
	}
}

// GenerateAccessToken emite o JWT de acesso e devolve sua validade em segundos.
func (p *JWTProvider) GenerateAccessToken(userID uuid.UUID) (string, int, error) {
	now := time.Now().UTC()
	expiresAt := now.Add(p.accessTTL)

	claims := jwt.RegisteredClaims{
		Subject:   userID.String(),
		Issuer:    p.issuer,
		IssuedAt:  jwt.NewNumericDate(now),
		NotBefore: jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(expiresAt),
		ID:        uuid.NewString(),
	}

	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(p.secret)
	if err != nil {
		return "", 0, fmt.Errorf("falha ao assinar o token: %w", err)
	}

	return signed, int(p.accessTTL.Seconds()), nil
}

// ParseAccessToken valida a assinatura e a validade do JWT, devolvendo o
// usuario autenticado.
func (p *JWTProvider) ParseAccessToken(token string) (uuid.UUID, error) {
	invalidToken := domainerr.Unauthorized("invalid_token", "sessao invalida ou expirada")

	parsed, err := jwt.ParseWithClaims(
		token,
		&jwt.RegisteredClaims{},
		func(t *jwt.Token) (any, error) {
			// Sem esta checagem, um token forjado com alg "none" (ou com um
			// algoritmo assimetrico) seria aceito.
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("algoritmo de assinatura inesperado: %v", t.Header["alg"])
			}
			return p.secret, nil
		},
		jwt.WithIssuer(p.issuer),
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
	)
	if err != nil || !parsed.Valid {
		return uuid.Nil, invalidToken
	}

	claims, ok := parsed.Claims.(*jwt.RegisteredClaims)
	if !ok {
		return uuid.Nil, invalidToken
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return uuid.Nil, invalidToken
	}
	return userID, nil
}

// GenerateRefreshToken cria um segredo opaco de 256 bits.
//
// O refresh token nao e um JWT de proposito: ele nao precisa carregar
// informacao, e revogavel no banco e nao pode ser lido pelo cliente.
func (p *JWTProvider) GenerateRefreshToken() (string, time.Time, error) {
	buffer := make([]byte, 32)
	if _, err := rand.Read(buffer); err != nil {
		return "", time.Time{}, fmt.Errorf("falha ao gerar o refresh token: %w", err)
	}

	return base64.RawURLEncoding.EncodeToString(buffer), time.Now().UTC().Add(p.refreshTTL), nil
}

// HashRefreshToken deriva o hash persistido do refresh token.
//
// SHA-256 e suficiente aqui (diferente da senha): o token ja e um segredo
// aleatorio de alta entropia, sem risco de ataque de dicionario.
func (p *JWTProvider) HashRefreshToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
