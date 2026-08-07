// Package middleware reune os interceptadores HTTP: autenticacao, CORS, log,
// recuperacao de panico e identificacao de requisicao.
package middleware

import (
	"context"

	"github.com/google/uuid"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

type contextKey string

const (
	userIDKey    contextKey = "nexosgen-nexosfinn.user_id"
	scopesKey    contextKey = "nexosgen-nexosfinn.scopes"
	requestIDKey contextKey = "nexosgen-nexosfinn.request_id"
)

// WithUserID anexa o usuario autenticado ao contexto.
func WithUserID(ctx context.Context, userID uuid.UUID) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

// UserID recupera o usuario autenticado do contexto.
func UserID(ctx context.Context) (uuid.UUID, bool) {
	userID, ok := ctx.Value(userIDKey).(uuid.UUID)
	return userID, ok && userID != uuid.Nil
}

// WithScopes anexa os escopos concedidos pela API Key ao contexto.
func WithScopes(ctx context.Context, scopes []vo.Scope) context.Context {
	return context.WithValue(ctx, scopesKey, scopes)
}

// Scopes recupera os escopos do contexto.
func Scopes(ctx context.Context) []vo.Scope {
	scopes, _ := ctx.Value(scopesKey).([]vo.Scope)
	return scopes
}

// WithRequestID anexa o identificador da requisicao ao contexto.
func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, requestIDKey, requestID)
}

// RequestIDFrom recupera o identificador da requisicao.
func RequestIDFrom(ctx context.Context) string {
	requestID, _ := ctx.Value(requestIDKey).(string)
	return requestID
}
