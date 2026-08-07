package valueobject_test

import (
	"testing"
	"time"

	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func date(year int, month time.Month, day int) time.Time {
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

func TestNewPeriodRejeitaIntervaloInvertido(t *testing.T) {
	_, err := vo.NewPeriod(date(2024, time.May, 31), date(2024, time.May, 1))
	require.Error(t, err)
}

func TestNewMonthPeriod(t *testing.T) {
	period := vo.NewMonthPeriod(date(2024, time.May, 15))
	assert.Equal(t, date(2024, time.May, 1), period.Start())
	assert.Equal(t, date(2024, time.May, 31), period.End())
	assert.Equal(t, 31, period.Days())
}

func TestPeriodPreviousDeMesInteiroEhOMesAnterior(t *testing.T) {
	period := vo.NewMonthPeriod(date(2024, time.May, 10))
	previous := period.Previous()

	assert.Equal(t, date(2024, time.April, 1), previous.Start())
	assert.Equal(t, date(2024, time.April, 30), previous.End(),
		"maio tem 31 dias e abril 30: o comparativo e por mes-calendario, nao por duracao")
}

func TestPeriodPreviousDeRecorteArbitrarioMantemDuracao(t *testing.T) {
	period, err := vo.NewPeriod(date(2024, time.May, 10), date(2024, time.May, 19))
	require.NoError(t, err)

	previous := period.Previous()

	assert.Equal(t, date(2024, time.April, 30), previous.Start())
	assert.Equal(t, date(2024, time.May, 9), previous.End())
	assert.Equal(t, period.Days(), previous.Days())
}

func TestPeriodContains(t *testing.T) {
	period, err := vo.NewPeriod(date(2024, time.May, 1), date(2024, time.May, 31))
	require.NoError(t, err)

	assert.True(t, period.Contains(date(2024, time.May, 1)))
	assert.True(t, period.Contains(date(2024, time.May, 31)))
	assert.False(t, period.Contains(date(2024, time.June, 1)))
}

func TestMonthsUntil(t *testing.T) {
	assert.Equal(t, 6, vo.MonthsUntil(date(2024, time.May, 31), date(2024, time.November, 30)))
	assert.Equal(t, 12, vo.MonthsUntil(date(2024, time.May, 1), date(2025, time.May, 1)))
	assert.Equal(t, 0, vo.MonthsUntil(date(2024, time.May, 1), date(2024, time.April, 1)), "prazo vencido nao gera meses negativos")
}
