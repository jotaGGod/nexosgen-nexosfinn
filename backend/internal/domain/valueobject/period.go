package valueobject

import (
	"time"

	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
)

// Period e um intervalo fechado de datas [Start, End].
//
// Serve de base para os comparativos "vs periodo anterior" do dashboard e
// dos relatorios.
type Period struct {
	start time.Time
	end   time.Time
}

// TruncateToDay zera o horario mantendo a data em UTC.
func TruncateToDay(t time.Time) time.Time {
	utc := t.UTC()
	return time.Date(utc.Year(), utc.Month(), utc.Day(), 0, 0, 0, 0, time.UTC)
}

// NewPeriod cria um intervalo garantindo que o inicio nao ultrapasse o fim.
func NewPeriod(start, end time.Time) (Period, error) {
	s := TruncateToDay(start)
	e := TruncateToDay(end)
	if e.Before(s) {
		return Period{}, domainerr.InvalidInput("invalid_period", "a data final deve ser posterior ou igual a data inicial")
	}
	return Period{start: s, end: e}, nil
}

// NewMonthPeriod devolve o periodo que cobre o mes inteiro da data informada.
func NewMonthPeriod(reference time.Time) Period {
	utc := reference.UTC()
	start := time.Date(utc.Year(), utc.Month(), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, -1)
	return Period{start: start, end: end}
}

func (p Period) Start() time.Time { return p.start }
func (p Period) End() time.Time   { return p.end }

// Days devolve a quantidade de dias cobertos, incluindo as duas extremidades.
func (p Period) Days() int {
	return int(p.end.Sub(p.start).Hours()/24) + 1
}

// IsFullMonth reporta se o periodo cobre exatamente um mes-calendario.
func (p Period) IsFullMonth() bool {
	firstDay := time.Date(p.start.Year(), p.start.Month(), 1, 0, 0, 0, 0, time.UTC)
	lastDay := firstDay.AddDate(0, 1, -1)
	return p.start.Equal(firstDay) && p.end.Equal(lastDay)
}

// Previous devolve o periodo imediatamente anterior, usado para calcular a
// variacao percentual dos cards de resumo.
//
// Quando o periodo cobre um mes-calendario inteiro, o anterior e o mes
// anterior completo — e o que o usuario entende por "vs mes anterior", ainda
// que os meses tenham durações diferentes. Para recortes arbitrarios, o
// anterior e a janela de mesma duracao que termina na vespera.
func (p Period) Previous() Period {
	if p.IsFullMonth() {
		return NewMonthPeriod(p.start.AddDate(0, 0, -1))
	}

	days := p.Days()
	end := p.start.AddDate(0, 0, -1)
	start := end.AddDate(0, 0, -(days - 1))
	return Period{start: start, end: end}
}

// Contains reporta se a data esta dentro do intervalo.
func (p Period) Contains(t time.Time) bool {
	day := TruncateToDay(t)
	return !day.Before(p.start) && !day.After(p.end)
}

// MonthsUntil devolve quantos meses inteiros faltam entre o periodo e a data
// informada. Nunca retorna negativo.
func MonthsUntil(from, to time.Time) int {
	f := TruncateToDay(from)
	t := TruncateToDay(to)
	if !t.After(f) {
		return 0
	}
	months := (t.Year()-f.Year())*12 + int(t.Month()) - int(f.Month())
	if t.Day() > f.Day() {
		months++
	}
	if months < 0 {
		return 0
	}
	return months
}
