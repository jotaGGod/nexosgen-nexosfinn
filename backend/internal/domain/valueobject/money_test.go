package valueobject_test

import (
	"testing"

	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewMoneyFromReais(t *testing.T) {
	tests := []struct {
		name          string
		input         float64
		expectedCents int64
	}{
		{"valor inteiro", 100, 10000},
		{"duas casas decimais", 19.99, 1999},
		{"arredondamento de ponto flutuante", 0.07, 7},
		{"valor negativo", -356.80, -35680},
		{"zero", 0, 0},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			money, err := vo.NewMoneyFromReais(tc.input)
			require.NoError(t, err)
			assert.Equal(t, tc.expectedCents, money.Cents())
		})
	}
}

func TestNewMoneyFromReaisRejectsOutOfRange(t *testing.T) {
	_, err := vo.NewMoneyFromReais(1e13)
	require.Error(t, err)
}

func TestMoneyArithmetic(t *testing.T) {
	ten := vo.NewMoney(1000)
	three := vo.NewMoney(300)

	assert.Equal(t, int64(1300), ten.Add(three).Cents())
	assert.Equal(t, int64(700), ten.Sub(three).Cents())
	assert.Equal(t, int64(-1000), ten.Neg().Cents())
	assert.Equal(t, int64(1000), ten.Neg().Abs().Cents())
	assert.True(t, ten.GreaterThan(three))
	assert.True(t, vo.ZeroMoney.IsZero())
}

func TestMoneyPercentageOf(t *testing.T) {
	assert.InDelta(t, 31.96, vo.NewMoney(285427).PercentageOf(vo.NewMoney(893210)), 0.01)
	assert.Equal(t, 0.0, vo.NewMoney(100).PercentageOf(vo.ZeroMoney), "divisao por zero deve devolver zero")
}

func TestMoneyDivideByArredondaParaCima(t *testing.T) {
	// R$ 100,00 em 3 parcelas: o ultimo centavo sobe para nao faltar valor.
	assert.Equal(t, int64(3334), vo.NewMoney(10000).DivideBy(3).Cents())
	assert.Equal(t, int64(2500), vo.NewMoney(10000).DivideBy(4).Cents())
	assert.Equal(t, vo.ZeroMoney, vo.NewMoney(10000).DivideBy(0))
}

func TestMoneyString(t *testing.T) {
	assert.Equal(t, "R$ 1.234,56", vo.NewMoney(123456).String())
	assert.Equal(t, "R$ 0,07", vo.NewMoney(7).String())
	assert.Equal(t, "-R$ 356,80", vo.NewMoney(-35680).String())
	assert.Equal(t, "R$ 24.856,90", vo.NewMoney(2485690).String())
	assert.Equal(t, "R$ 1.000.000,00", vo.NewMoney(100000000).String())
}
