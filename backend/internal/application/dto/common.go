// Package dto define os contratos de entrada e saida dos casos de uso.
//
// Os DTOs isolam o dominio da serializacao: entidades nunca sao devolvidas
// direto para a camada HTTP, e nenhum tipo aqui conhece http.Request.
package dto

import (
	"time"

	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// DateLayout e o formato aceito e devolvido pela API para datas sem hora.
const DateLayout = "2006-01-02"

// ParseDate converte uma data no formato ISO (YYYY-MM-DD).
func ParseDate(raw, field string) (time.Time, error) {
	parsed, err := time.Parse(DateLayout, raw)
	if err != nil {
		return time.Time{}, domainerr.InvalidInput("invalid_date", field+" deve estar no formato AAAA-MM-DD")
	}
	return parsed.UTC(), nil
}

// ParseOptionalDate converte uma data opcional; string vazia devolve nil.
func ParseOptionalDate(raw, field string) (*time.Time, error) {
	if raw == "" {
		return nil, nil
	}
	parsed, err := ParseDate(raw, field)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}

// FormatDate serializa uma data no formato ISO.
func FormatDate(t time.Time) string { return t.UTC().Format(DateLayout) }

// FormatOptionalDate serializa uma data opcional.
func FormatOptionalDate(t *time.Time) string {
	if t == nil {
		return ""
	}
	return FormatDate(*t)
}

// PeriodInput delimita o intervalo consultado. Quando vazio, o caso de uso
// assume o mes corrente.
type PeriodInput struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

// Resolve converte a entrada em um Period do dominio, caindo no mes corrente
// quando nenhuma data e informada.
func (p PeriodInput) Resolve(now time.Time) (vo.Period, error) {
	if p.StartDate == "" && p.EndDate == "" {
		return vo.NewMonthPeriod(now), nil
	}

	start, err := ParseDate(p.StartDate, "data inicial")
	if err != nil {
		return vo.Period{}, err
	}
	end, err := ParseDate(p.EndDate, "data final")
	if err != nil {
		return vo.Period{}, err
	}
	return vo.NewPeriod(start, end)
}

// PeriodOutput descreve o intervalo efetivamente considerado na resposta.
type PeriodOutput struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

// ToPeriodOutput serializa um Period.
func ToPeriodOutput(period vo.Period) PeriodOutput {
	return PeriodOutput{
		StartDate: FormatDate(period.Start()),
		EndDate:   FormatDate(period.End()),
	}
}

// MoneyOutput acompanha o valor bruto e a formatacao pt-BR, evitando que
// cada cliente reimplemente a mascara de moeda.
type MoneyOutput struct {
	Amount    float64 `json:"amount"`
	Formatted string  `json:"formatted"`
}

// ToMoneyOutput serializa um valor monetario.
func ToMoneyOutput(money vo.Money) MoneyOutput {
	return MoneyOutput{Amount: money.Reais(), Formatted: money.String()}
}

// PaginationOutput descreve a pagina devolvida em listagens.
type PaginationOutput struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// NewPaginationOutput calcula os metadados de paginacao.
func NewPaginationOutput(page, pageSize, total int) PaginationOutput {
	totalPages := 0
	if pageSize > 0 {
		totalPages = (total + pageSize - 1) / pageSize
	}
	return PaginationOutput{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages}
}
