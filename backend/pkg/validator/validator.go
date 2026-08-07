// Package validator oferece validacao de entrada acumulativa para os casos
// de uso.
//
// Diferente da validacao de invariantes (que vive nas entidades e falha no
// primeiro problema), aqui todos os erros sao coletados de uma vez para que o
// formulario da interface destaque todos os campos invalidos em uma unica
// resposta.
package validator

import (
	"strings"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
)

// Validator acumula erros por campo.
type Validator struct {
	fields map[string]string
}

// New cria um validador vazio.
func New() *Validator {
	return &Validator{fields: make(map[string]string)}
}

// Add registra um erro para o campo, preservando o primeiro erro encontrado.
func (v *Validator) Add(field, message string) *Validator {
	if _, exists := v.fields[field]; !exists {
		v.fields[field] = message
	}
	return v
}

// Required exige um valor de texto nao vazio.
func (v *Validator) Required(field, value, label string) *Validator {
	if strings.TrimSpace(value) == "" {
		v.Add(field, label+" e obrigatorio")
	}
	return v
}

// MinLength exige um comprimento minimo.
func (v *Validator) MinLength(field, value, label string, min int) *Validator {
	if len([]rune(strings.TrimSpace(value))) < min {
		v.Add(field, label+" deve ter no minimo "+itoa(min)+" caracteres")
	}
	return v
}

// MaxLength exige um comprimento maximo.
func (v *Validator) MaxLength(field, value, label string, max int) *Validator {
	if len([]rune(strings.TrimSpace(value))) > max {
		v.Add(field, label+" deve ter no maximo "+itoa(max)+" caracteres")
	}
	return v
}

// Positive exige um numero maior que zero.
func (v *Validator) Positive(field string, value float64, label string) *Validator {
	if value <= 0 {
		v.Add(field, label+" deve ser maior que zero")
	}
	return v
}

// NotNegative exige um numero maior ou igual a zero.
func (v *Validator) NotNegative(field string, value float64, label string) *Validator {
	if value < 0 {
		v.Add(field, label+" nao pode ser negativo")
	}
	return v
}

// UUID valida e converte um identificador obrigatorio.
func (v *Validator) UUID(field, value, label string) uuid.UUID {
	if strings.TrimSpace(value) == "" {
		v.Add(field, label+" e obrigatorio")
		return uuid.Nil
	}
	parsed, err := uuid.Parse(value)
	if err != nil {
		v.Add(field, label+" e invalido")
		return uuid.Nil
	}
	return parsed
}

// OptionalUUID valida um identificador opcional; vazio devolve uuid.Nil.
func (v *Validator) OptionalUUID(field, value, label string) uuid.UUID {
	if strings.TrimSpace(value) == "" {
		return uuid.Nil
	}
	return v.UUID(field, value, label)
}

// In exige que o valor esteja entre as opcoes permitidas.
func (v *Validator) In(field, value, label string, allowed ...string) *Validator {
	for _, option := range allowed {
		if strings.EqualFold(value, option) {
			return v
		}
	}
	v.Add(field, label+" deve ser um dos valores: "+strings.Join(allowed, ", "))
	return v
}

// Valid reporta se nenhum erro foi acumulado.
func (v *Validator) Valid() bool { return len(v.fields) == 0 }

// Error devolve o erro de dominio agregado, ou nil quando tudo esta valido.
func (v *Validator) Error() error {
	if v.Valid() {
		return nil
	}
	return domainerr.InvalidInput("validation_failed", "dados invalidos").WithFields(v.fields)
}

func itoa(value int) string {
	if value == 0 {
		return "0"
	}

	digits := make([]byte, 0, 8)
	for value > 0 {
		digits = append([]byte{byte('0' + value%10)}, digits...)
		value /= 10
	}
	return string(digits)
}
