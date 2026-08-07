package valueobject

import (
	"fmt"
	"math"
	"strings"

	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
)

// Money representa um valor monetario em centavos.
//
// Valores financeiros nunca sao guardados em float: toda a aritmetica do
// dominio acontece sobre int64 e a conversao de/para reais fica isolada aqui.
type Money struct {
	cents int64
}

// ZeroMoney e o valor neutro da adicao.
var ZeroMoney = Money{}

// NewMoney cria um Money a partir de centavos.
func NewMoney(cents int64) Money { return Money{cents: cents} }

// NewMoneyFromReais converte um valor decimal em reais para Money.
func NewMoneyFromReais(value float64) (Money, error) {
	if math.IsNaN(value) || math.IsInf(value, 0) {
		return Money{}, domainerr.InvalidInput("invalid_amount", "valor monetario invalido")
	}
	if math.Abs(value) > 1e12 {
		return Money{}, domainerr.InvalidInput("amount_out_of_range", "valor monetario fora do intervalo suportado")
	}
	return Money{cents: int64(math.Round(value * 100))}, nil
}

// Cents devolve a representacao interna, usada na persistencia.
func (m Money) Cents() int64 { return m.cents }

// Reais devolve o valor decimal, usado na serializacao JSON.
func (m Money) Reais() float64 { return float64(m.cents) / 100 }

func (m Money) Add(other Money) Money { return Money{cents: m.cents + other.cents} }

func (m Money) Sub(other Money) Money { return Money{cents: m.cents - other.cents} }

// Neg inverte o sinal do valor.
func (m Money) Neg() Money { return Money{cents: -m.cents} }

// Abs devolve o valor absoluto.
func (m Money) Abs() Money {
	if m.cents < 0 {
		return m.Neg()
	}
	return m
}

func (m Money) IsZero() bool     { return m.cents == 0 }
func (m Money) IsPositive() bool { return m.cents > 0 }
func (m Money) IsNegative() bool { return m.cents < 0 }

// GreaterThan compara dois valores monetarios.
func (m Money) GreaterThan(other Money) bool { return m.cents > other.cents }

// PercentageOf devolve quanto m representa de total, em pontos percentuais.
// Retorna 0 quando total e zero, evitando divisao por zero no dominio.
func (m Money) PercentageOf(total Money) float64 {
	if total.cents == 0 {
		return 0
	}
	return math.Round(float64(m.cents)/float64(total.cents)*10000) / 100
}

// DivideBy reparte o valor em n parcelas, arredondando para cima o ultimo centavo.
// Usado no calculo de "valor sugerido por mes" das metas.
func (m Money) DivideBy(n int) Money {
	if n <= 0 {
		return ZeroMoney
	}
	quotient := m.cents / int64(n)
	if m.cents%int64(n) != 0 {
		quotient++
	}
	return Money{cents: quotient}
}

// String formata o valor no padrao brasileiro (R$ 1.234,56).
func (m Money) String() string {
	sign := ""
	cents := m.cents
	if cents < 0 {
		sign = "-"
		cents = -cents
	}

	units := cents / 100
	remainder := cents % 100

	digits := fmt.Sprintf("%d", units)
	var grouped strings.Builder
	for i, digit := range digits {
		if i > 0 && (len(digits)-i)%3 == 0 {
			grouped.WriteByte('.')
		}
		grouped.WriteRune(digit)
	}

	return fmt.Sprintf("%sR$ %s,%02d", sign, grouped.String(), remainder)
}
