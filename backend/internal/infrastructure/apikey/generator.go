// Package apikey gera e verifica os segredos das chaves de integracao.
package apikey

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"
)

// visiblePrefixLength e quantos caracteres do segredo aparecem na listagem,
// o suficiente para o usuario reconhecer a chave sem expor material util.
const visiblePrefixLength = 8

// Generator produz chaves no formato <prefixo>_<segredo aleatorio>.
type Generator struct {
	prefix string
}

// NewGenerator cria o gerador com o prefixo do ambiente (ex.: "fin_live").
func NewGenerator(prefix string) *Generator {
	prefix = strings.TrimSpace(prefix)
	if prefix == "" {
		prefix = "fin_live"
	}
	return &Generator{prefix: prefix}
}

// Generate devolve o segredo em texto puro, o prefixo exibivel e o hash.
//
// O texto puro sai daqui direto para a resposta HTTP da criacao e nunca e
// gravado; o que a aplicacao guarda e o hash.
func (g *Generator) Generate() (string, string, string, error) {
	buffer := make([]byte, 32)
	if _, err := rand.Read(buffer); err != nil {
		return "", "", "", fmt.Errorf("falha ao gerar a chave de API: %w", err)
	}

	secret := base64.RawURLEncoding.EncodeToString(buffer)
	plainKey := g.prefix + "_" + secret

	visible := secret
	if len(visible) > visiblePrefixLength {
		visible = visible[:visiblePrefixLength]
	}
	prefix := g.prefix + "_" + visible + "..."

	return plainKey, prefix, g.Hash(plainKey), nil
}

// Hash deriva o hash de uma chave apresentada em uma requisicao.
//
// SHA-256 sem salt e proposital: a busca precisa localizar a chave por hash em
// uma unica consulta indexada, e o segredo tem 256 bits de entropia — nao ha
// dicionario a proteger.
func (g *Generator) Hash(plainKey string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(plainKey)))
	return hex.EncodeToString(sum[:])
}
