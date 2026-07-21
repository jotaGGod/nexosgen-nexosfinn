package entity

import (
	"regexp"
	"strings"

	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
)

const maxNameLength = 120

var hexColorPattern = regexp.MustCompile(`^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`)

// normalizeName aplica as regras comuns de nomeacao das entidades do usuario.
func normalizeName(raw, code, label string) (string, error) {
	name := strings.TrimSpace(raw)
	if name == "" {
		return "", domainerr.InvalidInput(code+"_required", label+" e obrigatorio")
	}
	if len(name) > maxNameLength {
		return "", domainerr.InvalidInput(code+"_too_long", label+" excede o tamanho maximo")
	}
	return name, nil
}

// normalizeColor valida uma cor hexadecimal, caindo no roxo primario quando vazia.
func normalizeColor(raw string) (string, error) {
	color := strings.TrimSpace(raw)
	if color == "" {
		return "#7C3AED", nil
	}
	if !hexColorPattern.MatchString(color) {
		return "", domainerr.InvalidInput("invalid_color", "cor deve estar no formato hexadecimal, ex.: #7C3AED")
	}
	return strings.ToUpper(color), nil
}

// normalizeIcon valida o identificador de icone, aplicando um padrao quando vazio.
func normalizeIcon(raw, fallback string) (string, error) {
	icon := strings.TrimSpace(raw)
	if icon == "" {
		return fallback, nil
	}
	if len(icon) > 60 {
		return "", domainerr.InvalidInput("invalid_icon", "identificador de icone invalido")
	}
	return icon, nil
}
