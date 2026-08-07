package entity_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewGoalRejeitaAlvoNaoPositivo(t *testing.T) {
	_, err := entity.NewGoal(uuid.New(), "Viagem Europa", vo.ZeroMoney, vo.ZeroMoney, nil, "", "", "")
	assert.Error(t, err)
}

func TestGoalContribute(t *testing.T) {
	deadline := time.Date(2024, time.November, 30, 0, 0, 0, 0, time.UTC)
	goal, err := entity.NewGoal(uuid.New(), "Viagem Europa", vo.NewMoney(1000000), vo.NewMoney(543000), &deadline, "", "", "")
	require.NoError(t, err)

	require.NoError(t, goal.Contribute(vo.NewMoney(57000)))
	assert.Equal(t, int64(600000), goal.CurrentAmount.Cents())

	require.NoError(t, goal.Contribute(vo.NewMoney(-100000)), "aporte negativo corrige um lancamento errado")
	assert.Equal(t, int64(500000), goal.CurrentAmount.Cents())
}

func TestGoalContributeRejeitaSaldoNegativo(t *testing.T) {
	goal, err := entity.NewGoal(uuid.New(), "Reserva", vo.NewMoney(1000000), vo.NewMoney(1000), nil, "", "", "")
	require.NoError(t, err)

	assert.Error(t, goal.Contribute(vo.NewMoney(-2000)))
	assert.Error(t, goal.Contribute(vo.ZeroMoney))
}

func TestGoalIsCompleted(t *testing.T) {
	goal, err := entity.NewGoal(uuid.New(), "Reserva", vo.NewMoney(1500000), vo.NewMoney(1500000), nil, "", "", "")
	require.NoError(t, err)
	assert.True(t, goal.IsCompleted())
}

func TestNewGoalValidaCor(t *testing.T) {
	_, err := entity.NewGoal(uuid.New(), "Reserva", vo.NewMoney(100), vo.ZeroMoney, nil, "", "", "roxo")
	assert.Error(t, err)

	goal, err := entity.NewGoal(uuid.New(), "Reserva", vo.NewMoney(100), vo.ZeroMoney, nil, "", "", "#7c3aed")
	require.NoError(t, err)
	assert.Equal(t, "#7C3AED", goal.Color)
}
