package valueobject

import (
	"regexp"
	"strings"

	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
)

var emailPattern = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Email e um endereco de e-mail valido e normalizado em minusculas.
//
// A normalizacao acontece na construcao, o que permite que a unicidade no
// banco seja garantida por um indice unico simples.
type Email struct {
	value string
}

// NewEmail valida e normaliza um endereco de e-mail.
func NewEmail(raw string) (Email, error) {
	normalized := strings.ToLower(strings.TrimSpace(raw))
	if normalized == "" {
		return Email{}, domainerr.InvalidInput("email_required", "e-mail e obrigatorio")
	}
	if len(normalized) > 254 {
		return Email{}, domainerr.InvalidInput("email_too_long", "e-mail excede o tamanho maximo")
	}
	if !emailPattern.MatchString(normalized) {
		return Email{}, domainerr.InvalidInput("email_invalid", "e-mail em formato invalido")
	}
	return Email{value: normalized}, nil
}

func (e Email) String() string { return e.value }

func (e Email) IsZero() bool { return e.value == "" }
