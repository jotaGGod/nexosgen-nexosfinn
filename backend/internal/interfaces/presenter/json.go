// Package presenter serializa as respostas HTTP.
//
// E aqui que o resultado dos casos de uso vira JSON e que os erros de dominio
// viram status code — nenhuma outra camada precisa conhecer HTTP.
package presenter

import (
	"encoding/json"
	"net/http"
)

// JSON escreve o payload com o status informado.
func JSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)

	if payload == nil {
		return
	}
	// O cabecalho ja foi enviado; uma falha de encoding aqui so pode ser
	// registrada, nao corrigida.
	_ = json.NewEncoder(w).Encode(payload)
}

// NoContent responde 204.
func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Envelope embrulha uma colecao em um objeto, mantendo espaco para metadados
// futuros sem quebrar o cliente.
type Envelope struct {
	Data any `json:"data"`
}

// Data responde 200 com a colecao embrulhada.
func Data(w http.ResponseWriter, payload any) {
	JSON(w, http.StatusOK, Envelope{Data: payload})
}
