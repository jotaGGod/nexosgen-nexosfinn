package valueobject

import (
	"strings"

	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
)

// Scope delimita o que uma API Key pode fazer.
//
// Os escopos existem para que uma automacao externa (por exemplo, um workflow
// n8n ligado ao WhatsApp) receba apenas a permissao necessaria: um assistente
// que so consulta saldo nao precisa de permissao de escrita.
type Scope string

const (
	ScopeReadTransactions  Scope = "read:transactions"
	ScopeWriteTransactions Scope = "write:transactions"
	ScopeReadBalance       Scope = "read:balance"
	ScopeReadCategories    Scope = "read:categories"
)

// AllScopes lista os escopos concedidos por padrao a uma nova chave.
func AllScopes() []Scope {
	return []Scope{ScopeReadTransactions, ScopeWriteTransactions, ScopeReadBalance, ScopeReadCategories}
}

// ParseScope valida um escopo individual.
func ParseScope(raw string) (Scope, error) {
	scope := Scope(strings.ToLower(strings.TrimSpace(raw)))
	if !scope.IsValid() {
		return "", domainerr.InvalidInput("invalid_scope", "escopo desconhecido: "+raw)
	}
	return scope, nil
}

// ParseScopes valida uma lista de escopos, removendo duplicatas.
// Uma lista vazia recebe o conjunto completo de escopos.
func ParseScopes(raw []string) ([]Scope, error) {
	if len(raw) == 0 {
		return AllScopes(), nil
	}

	seen := make(map[Scope]struct{}, len(raw))
	scopes := make([]Scope, 0, len(raw))
	for _, item := range raw {
		scope, err := ParseScope(item)
		if err != nil {
			return nil, err
		}
		if _, duplicated := seen[scope]; duplicated {
			continue
		}
		seen[scope] = struct{}{}
		scopes = append(scopes, scope)
	}
	return scopes, nil
}

func (s Scope) String() string { return string(s) }

// IsValid reporta se o escopo esta entre os valores conhecidos.
func (s Scope) IsValid() bool {
	switch s {
	case ScopeReadTransactions, ScopeWriteTransactions, ScopeReadBalance, ScopeReadCategories:
		return true
	default:
		return false
	}
}

// ScopesToStrings converte para a representacao persistida em text[].
func ScopesToStrings(scopes []Scope) []string {
	out := make([]string, len(scopes))
	for i, scope := range scopes {
		out[i] = scope.String()
	}
	return out
}
