// Package logger configura o log estruturado da aplicacao.
package logger

import (
	"log/slog"
	"os"
	"strings"
)

// New cria um logger estruturado.
//
// Em desenvolvimento a saida e texto legivel no terminal; em producao e JSON,
// pronto para ser coletado por qualquer agregador de logs.
func New(level, env string) *slog.Logger {
	options := &slog.HandlerOptions{Level: parseLevel(level)}

	var handler slog.Handler
	if env == "production" {
		handler = slog.NewJSONHandler(os.Stdout, options)
	} else {
		handler = slog.NewTextHandler(os.Stdout, options)
	}

	return slog.New(handler)
}

func parseLevel(level string) slog.Level {
	switch strings.ToLower(strings.TrimSpace(level)) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
