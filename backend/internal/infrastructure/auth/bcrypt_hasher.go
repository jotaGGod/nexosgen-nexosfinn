package auth

import (
	"golang.org/x/crypto/bcrypt"
)

// BcryptHasher implementa o hash de senha com bcrypt.
type BcryptHasher struct {
	cost int
}

// NewBcryptHasher cria o hasher. Custo zero ou invalido cai no padrao da lib.
func NewBcryptHasher(cost int) *BcryptHasher {
	if cost < bcrypt.MinCost || cost > bcrypt.MaxCost {
		cost = bcrypt.DefaultCost
	}
	return &BcryptHasher{cost: cost}
}

// Hash gera o hash da senha.
func (h *BcryptHasher) Hash(plain string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(plain), h.cost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

// Compare confere a senha contra o hash em tempo constante.
func (h *BcryptHasher) Compare(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
