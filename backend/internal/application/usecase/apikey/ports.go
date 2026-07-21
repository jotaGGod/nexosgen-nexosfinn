// Package apikey reune os casos de uso das credenciais de integracao externa.
//
// Estas chaves existem para que automacoes — em especial o workflow n8n que
// atendera o WhatsApp — consigam lancar e consultar transacoes sem simular o
// login web. A automacao em si nao faz parte deste projeto; o que este pacote
// entrega e a credencial e sua validacao.
package apikey

// Generator produz e verifica os segredos das chaves de API.
//
// A interface e declarada aqui e implementada em
// internal/infrastructure/apikey.
type Generator interface {
	// Generate devolve o segredo em texto puro (mostrado uma unica vez ao
	// usuario), o prefixo legivel e o hash a ser persistido.
	Generate() (plainKey, prefix, keyHash string, err error)

	// Hash deriva o hash de uma chave apresentada em uma requisicao, para
	// comparacao com o valor persistido.
	Hash(plainKey string) string
}
