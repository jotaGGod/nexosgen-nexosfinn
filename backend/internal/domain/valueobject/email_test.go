package valueobject_test

import (
	"testing"

	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewEmailNormaliza(t *testing.T) {
	email, err := vo.NewEmail("  Joao.Silva@Email.COM ")
	require.NoError(t, err)
	assert.Equal(t, "joao.silva@email.com", email.String())
}

func TestNewEmailRejeitaInvalidos(t *testing.T) {
	invalid := []string{"", "sem-arroba", "@dominio.com", "usuario@", "usuario@dominio", "a b@dominio.com"}

	for _, raw := range invalid {
		t.Run(raw, func(t *testing.T) {
			_, err := vo.NewEmail(raw)
			assert.Error(t, err)
		})
	}
}
