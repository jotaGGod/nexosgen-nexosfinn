package transaction

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
	"github.com/jacks/finapp/backend/pkg/validator"
)

// CreateUseCase registra um novo lancamento.
type CreateUseCase struct {
	transactions repository.TransactionRepository
	categories   repository.CategoryRepository
	accounts     repository.AccountRepository
}

// NewCreateUseCase monta o caso de uso com suas dependencias.
func NewCreateUseCase(
	transactions repository.TransactionRepository,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
) *CreateUseCase {
	return &CreateUseCase{transactions: transactions, categories: categories, accounts: accounts}
}

// Execute valida a entrada, resolve as referencias e persiste o lancamento.
func (uc *CreateUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.CreateTransactionInput) (*dto.TransactionOutput, error) {
	v := validator.New()
	v.Required("type", input.Type, "tipo")
	v.Positive("amount", input.Amount, "valor")
	v.Required("description", input.Description, "descricao").
		MaxLength("description", input.Description, "descricao", 200)
	categoryID := v.UUID("category_id", input.CategoryID, "categoria")
	accountID := v.UUID("account_id", input.AccountID, "conta")
	if err := v.Error(); err != nil {
		return nil, err
	}

	transactionType, err := vo.ParseTransactionType(input.Type)
	if err != nil {
		return nil, err
	}

	amount, err := vo.NewMoneyFromReais(input.Amount)
	if err != nil {
		return nil, err
	}

	// Sem data informada, o lancamento e do dia — e o caso mais comum tanto na
	// interface quanto em uma mensagem de WhatsApp do tipo "gastei 50 no uber".
	occurredOn := time.Now().UTC()
	if input.Date != "" {
		occurredOn, err = dto.ParseDate(input.Date, "data")
		if err != nil {
			return nil, err
		}
	}

	category, account, err := resolveReferences(ctx, userID, categoryID, accountID, transactionType, uc.categories, uc.accounts)
	if err != nil {
		return nil, err
	}

	created, err := entity.NewTransaction(
		userID, accountID, categoryID,
		transactionType, amount,
		input.Description, input.Notes, occurredOn,
	)
	if err != nil {
		return nil, err
	}

	if err := uc.transactions.Create(ctx, created); err != nil {
		return nil, err
	}

	output := dto.ToTransactionOutput(created, category, account)
	return &output, nil
}
