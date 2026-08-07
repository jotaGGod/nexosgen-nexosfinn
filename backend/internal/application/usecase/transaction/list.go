package transaction

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// Limites de paginacao da listagem.
const (
	defaultPageSize = 10
	maxPageSize     = 100
)

// ListUseCase devolve a pagina de lancamentos que atende ao filtro.
type ListUseCase struct {
	transactions repository.TransactionRepository
	categories   repository.CategoryRepository
	accounts     repository.AccountRepository
}

// NewListUseCase monta o caso de uso com suas dependencias.
func NewListUseCase(
	transactions repository.TransactionRepository,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
) *ListUseCase {
	return &ListUseCase{transactions: transactions, categories: categories, accounts: accounts}
}

// Execute monta o filtro, consulta a pagina e agrega os totais do recorte.
func (uc *ListUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.ListTransactionsInput) (*dto.TransactionListOutput, error) {
	filter, err := buildFilter(userID, input)
	if err != nil {
		return nil, err
	}

	page, err := uc.transactions.List(ctx, filter)
	if err != nil {
		return nil, err
	}

	totals, err := uc.transactions.FilterTotals(ctx, filter)
	if err != nil {
		return nil, err
	}

	references, err := loadCatalog(ctx, userID, uc.categories, uc.accounts)
	if err != nil {
		return nil, err
	}

	items := make([]dto.TransactionOutput, 0, len(page.Items))
	for _, item := range page.Items {
		items = append(items, dto.ToTransactionOutput(
			item,
			references.categories[item.CategoryID],
			references.accounts[item.AccountID],
		))
	}

	return &dto.TransactionListOutput{
		Items:      items,
		Pagination: dto.NewPaginationOutput(page.Page, page.PageSize, page.Total),
		Totals: dto.TransactionTotals{
			Income:  dto.ToMoneyOutput(totals.Income),
			Expense: dto.ToMoneyOutput(totals.Expense),
			Net:     dto.ToMoneyOutput(totals.Net()),
		},
	}, nil
}

// buildFilter traduz a entrada do cliente em um filtro do dominio, aplicando
// os limites de paginacao e ignorando identificadores malformados.
func buildFilter(userID uuid.UUID, input dto.ListTransactionsInput) (repository.TransactionFilter, error) {
	filter := repository.TransactionFilter{
		UserID:   userID,
		Search:   input.Search,
		Page:     input.Page,
		PageSize: input.PageSize,
		SortBy:   input.SortBy,
		SortDir:  input.SortDir,
	}

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 {
		filter.PageSize = defaultPageSize
	}
	if filter.PageSize > maxPageSize {
		filter.PageSize = maxPageSize
	}

	if input.Type != "" {
		transactionType, err := vo.ParseTransactionType(input.Type)
		if err != nil {
			return repository.TransactionFilter{}, err
		}
		filter.Type = &transactionType
	}

	// Sem datas, a listagem cobre todo o historico: a tela de transacoes tem
	// seu proprio seletor de periodo e comeca aberta.
	if input.Period.StartDate != "" || input.Period.EndDate != "" {
		period, err := input.Period.Resolve(time.Now().UTC())
		if err != nil {
			return repository.TransactionFilter{}, err
		}
		filter.Period = &period
	}

	for _, raw := range input.CategoryIDs {
		if id, err := uuid.Parse(raw); err == nil {
			filter.CategoryIDs = append(filter.CategoryIDs, id)
		}
	}
	for _, raw := range input.AccountIDs {
		if id, err := uuid.Parse(raw); err == nil {
			filter.AccountIDs = append(filter.AccountIDs, id)
		}
	}

	return filter, nil
}
