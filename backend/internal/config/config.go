// Package config carrega e valida a configuracao da aplicacao a partir do
// ambiente.
//
// E o unico ponto do backend que le variaveis de ambiente: o restante do
// codigo recebe a configuracao ja validada por injecao.
package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config reune todos os parametros de execucao do servico.
type Config struct {
	Env             string
	HTTPPort        string
	DatabaseURL     string
	JWTSecret       string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	CORSOrigins     []string
	LogLevel        string
	APIKeyPrefix    string
}

// IsProduction reporta se o servico roda em ambiente produtivo.
func (c *Config) IsProduction() bool { return c.Env == "production" }

// Load le o ambiente (e o .env local, quando existir) e valida os campos
// obrigatorios.
func Load() (*Config, error) {
	// Em Docker as variaveis vem do compose; o .env e conveniencia para quem
	// roda o backend direto na maquina.
	_ = godotenv.Load()

	cfg := &Config{
		Env: getEnv("APP_ENV", "development"),
		// PORT tem precedencia porque e a variavel que a Vercel injeta no
		// servico: o processo precisa escutar exatamente nela, senao o
		// healthcheck da plataforma nao encontra o servidor. Fora da Vercel
		// (Docker Compose, execucao local) vale HTTP_PORT.
		HTTPPort:        getEnv("PORT", getEnv("HTTP_PORT", "8080")),
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		JWTSecret:       os.Getenv("JWT_SECRET"),
		AccessTokenTTL:  getDuration("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL: getDuration("REFRESH_TOKEN_TTL", 7*24*time.Hour),
		CORSOrigins:     getList("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
		LogLevel:        getEnv("LOG_LEVEL", "info"),
		APIKeyPrefix:    getEnv("API_KEY_PREFIX", "nfh_live"),
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}
	return cfg, nil
}

func (c *Config) validate() error {
	var problems []string

	if c.DatabaseURL == "" {
		problems = append(problems, "DATABASE_URL e obrigatoria")
	}
	if c.JWTSecret == "" {
		problems = append(problems, "JWT_SECRET e obrigatoria")
	}
	// Um segredo curto derruba a garantia do HMAC; 32 bytes e o minimo
	// razoavel para HS256.
	if c.JWTSecret != "" && len(c.JWTSecret) < 32 {
		problems = append(problems, "JWT_SECRET deve ter ao menos 32 caracteres")
	}

	if len(problems) > 0 {
		return errors.New("configuracao invalida: " + strings.Join(problems, "; "))
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func getDuration(key string, fallback time.Duration) time.Duration {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}

	if parsed, err := time.ParseDuration(raw); err == nil {
		return parsed
	}
	// Aceita tambem um numero puro, interpretado como segundos.
	if seconds, err := strconv.Atoi(raw); err == nil {
		return time.Duration(seconds) * time.Second
	}

	fmt.Fprintf(os.Stderr, "aviso: %s invalido, usando padrao %s\n", key, fallback)
	return fallback
}

func getList(key string, fallback []string) []string {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}

	parts := strings.Split(raw, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			values = append(values, trimmed)
		}
	}
	if len(values) == 0 {
		return fallback
	}
	return values
}
