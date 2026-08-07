package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// TransactionFilter descreve uma consulta paginada de lancamentos.
type TransactionFilter struct {
	UserID      uuid.UUID
	Search      string
	CategoryIDs []uuid.UUID
	AccountIDs  []uuid.UUID
	Type        *vo.TransactionType
	Period      *vo.Period
	Page        int
	PageSize    int
	SortBy      string // occurred_on | amount | description
	SortDir     string // asc | desc
}

// TransactionPage e o resultado paginado de uma consulta.
type TransactionPage struct {
	Items    []*entity.Transaction
	Total    int
	Page     int
	PageSize int
}

// TransactionRepository cuida do ciclo de vida dos lancamentos.
//
// As agregacoes ficam em TransactionAnalyticsRepository: separa-las evita que
// um consumidor que so precisa de CRUD dependa de toda a superficie analitica
// (ISP).
type TransactionRepository interface {
	Create(ctx context.Context, transaction *entity.Transaction) error
	Update(ctx context.Context, transaction *entity.Transaction) error
	Delete(ctx context.Context, userID, id uuid.UUID) error
	FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Transaction, error)
	List(ctx context.Context, filter TransactionFilter) (TransactionPage, error)

	// FilterTotals soma receitas e despesas de todo o conjunto filtrado, nao
	// apenas da pagina corrente: os cards do topo da tela de transacoes
	// precisam refletir o filtro inteiro.
	FilterTotals(ctx context.Context, filter TransactionFilter) (Totals, error)
}
