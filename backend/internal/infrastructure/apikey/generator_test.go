package apikey_test

import (
	"strings"
	"testing"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/infrastructure/apikey"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGenerate(t *testing.T) {
	generator := apikey.NewGenerator("nfh_live")

	plainKey, prefix, hash, err := generator.Generate()
	require.NoError(t, err)

	assert.True(t, strings.HasPrefix(plainKey, "nfh_live_"))
	assert.True(t, strings.HasSuffix(prefix, "..."), "o prefixo exibido e truncado")
	assert.NotContains(t, hash, plainKey, "o hash nao pode conter a chave")
	assert.Len(t, hash, 64, "SHA-256 em hexadecimal")

	// O prefixo exibido nao pode revelar a chave inteira.
	assert.Less(t, len(strings.TrimSuffix(prefix, "...")), len(plainKey))
}

func TestGenerateProduzChavesUnicas(t *testing.T) {
	generator := apikey.NewGenerator("nfh_live")

	first, _, firstHash, err := generator.Generate()
	require.NoError(t, err)
	second, _, secondHash, err := generator.Generate()
	require.NoError(t, err)

	assert.NotEqual(t, first, second)
	assert.NotEqual(t, firstHash, secondHash)
}

func TestHashEhDeterministicoEIgnoraEspacos(t *testing.T) {
	generator := apikey.NewGenerator("nfh_live")

	assert.Equal(t, generator.Hash("nfh_live_abc"), generator.Hash("  nfh_live_abc  "))
	assert.NotEqual(t, generator.Hash("nfh_live_abc"), generator.Hash("nfh_live_abd"))
}
