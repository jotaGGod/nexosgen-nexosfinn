package entity

import (
	"time"

	"github.com/google/uuid"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// Category classifica transacoes e e a unidade de agrupamento dos relatorios,
// do grafico de rosca do dashboard e dos orcamentos mensais.
type Category struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Name      string
	Type      vo.TransactionType
	Color     string
	Icon      string
	Archived  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

// NewCategory cria uma categoria validada para o usuario informado.
func NewCategory(userID uuid.UUID, name string, categoryType vo.TransactionType, color, icon string) (*Category, error) {
	normalizedName, err := normalizeName(name, "name", "nome da categoria")
	if err != nil {
		return nil, err
	}

	if !categoryType.IsValid() {
		if _, parseErr := vo.ParseTransactionType(categoryType.String()); parseErr != nil {
			return nil, parseErr
		}
	}

	normalizedColor, err := normalizeColor(color)
	if err != nil {
		return nil, err
	}

	normalizedIcon, err := normalizeIcon(icon, "tag")
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	return &Category{
		ID:        uuid.New(),
		UserID:    userID,
		Name:      normalizedName,
		Type:      categoryType,
		Color:     normalizedColor,
		Icon:      normalizedIcon,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Update aplica alteracoes validadas na categoria.
func (c *Category) Update(name string, categoryType vo.TransactionType, color, icon string) error {
	normalizedName, err := normalizeName(name, "name", "nome da categoria")
	if err != nil {
		return err
	}

	if !categoryType.IsValid() {
		if _, parseErr := vo.ParseTransactionType(categoryType.String()); parseErr != nil {
			return parseErr
		}
	}

	normalizedColor, err := normalizeColor(color)
	if err != nil {
		return err
	}

	normalizedIcon, err := normalizeIcon(icon, "tag")
	if err != nil {
		return err
	}

	c.Name = normalizedName
	c.Type = categoryType
	c.Color = normalizedColor
	c.Icon = normalizedIcon
	c.UpdatedAt = time.Now().UTC()
	return nil
}

// Archive esconde a categoria das listagens sem apagar o historico.
func (c *Category) Archive() {
	c.Archived = true
	c.UpdatedAt = time.Now().UTC()
}
