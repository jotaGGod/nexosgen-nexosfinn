package transaction

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-financehub/backend/pkg/validator"
)

// UpdateUseCase altera um lancamento existente.
type UpdateUseCase struct {
	transactions repository.TransactionRepository
	categories   repository.CategoryRepository
	accounts     repository.AccountRepository
}

// NewUpdateUseCase monta o caso de uso com suas dependencias.
func NewUpdateUseCase(
	transactions repository.TransactionRepository,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
) *UpdateUseCase {
	return &UpdateUseCase{transactions: transactions, categories: categories, accounts: accounts}
}

// Execute valida a entrada e aplica as alteracoes no lancamento do usuario.
func (uc *UpdateUseCase) Execute(ctx context.Context, userID, transactionID uuid.UUID, input dto.UpdateTransactionInput) (*dto.TransactionOutput, error) {
	v := validator.New()
	v.Required("type", input.Type, "tipo")
	v.Positive("amount", input.Amount, "valor")
	v.Required("description", input.Description, "descricao").
		MaxLength("description", input.Description, "descricao", 200)
	categoryID := v.UUID("category_id", input.CategoryID, "categoria")
	accountID := v.UUID("account_id", input.AccountID, "conta")
	v.Required("date", input.Date, "data")
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

	occurredOn, err := dto.ParseDate(input.Date, "data")
	if err != nil {
		return nil, err
	}

	// FindByID ja e escopado por usuario: um id de outra conta responde
	// "nao encontrado", sem revelar que o recurso existe.
	existing, err := uc.transactions.FindByID(ctx, userID, transactionID)
	if err != nil {
		return nil, err
	}

	category, account, err := resolveReferences(ctx, userID, categoryID, accountID, transactionType, uc.categories, uc.accounts)
	if err != nil {
		return nil, err
	}

	if err := existing.Update(accountID, categoryID, transactionType, amount, input.Description, input.Notes, occurredOn); err != nil {
		return nil, err
	}

	if err := uc.transactions.Update(ctx, existing); err != nil {
		return nil, err
	}

	output := dto.ToTransactionOutput(existing, category, account)
	return &output, nil
}
