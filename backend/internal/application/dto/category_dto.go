package dto

import (
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
)

// CreateCategoryInput e o payload de criacao de categoria.
type CreateCategoryInput struct {
	Name  string `json:"name"`
	Type  string `json:"type"`
	Color string `json:"color"`
	Icon  string `json:"icon"`
}

// UpdateCategoryInput e o payload de atualizacao de categoria.
type UpdateCategoryInput struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Color    string `json:"color"`
	Icon     string `json:"icon"`
	Archived bool   `json:"archived"`
}

// CategoryRefOutput e a referencia enxuta usada dentro de outros recursos.
type CategoryRefOutput struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
	Icon  string `json:"icon"`
	Type  string `json:"type"`
}

// CategoryOutput e a projecao completa da categoria.
type CategoryOutput struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	Color    string `json:"color"`
	Icon     string `json:"icon"`
	Archived bool   `json:"archived"`
}

// ToCategoryRefOutput serializa a referencia da categoria.
func ToCategoryRefOutput(category *entity.Category) CategoryRefOutput {
	if category == nil {
		return CategoryRefOutput{}
	}
	return CategoryRefOutput{
		ID:    category.ID.String(),
		Name:  category.Name,
		Color: category.Color,
		Icon:  category.Icon,
		Type:  category.Type.String(),
	}
}

// ToCategoryOutput serializa a categoria.
func ToCategoryOutput(category *entity.Category) CategoryOutput {
	return CategoryOutput{
		ID:       category.ID.String(),
		Name:     category.Name,
		Type:     category.Type.String(),
		Color:    category.Color,
		Icon:     category.Icon,
		Archived: category.Archived,
	}
}
