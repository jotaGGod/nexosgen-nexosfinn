package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/http/middleware"
)

type IdempotencyRepository struct{ pool *pgxpool.Pool }

func NewIdempotencyRepository(pool *pgxpool.Pool) *IdempotencyRepository {
	return &IdempotencyRepository{pool: pool}
}

func (r *IdempotencyRepository) Claim(ctx context.Context, userID uuid.UUID, key, requestHash, method, path string) (middleware.IdempotencyClaim, error) {
	var inserted string
	err := r.pool.QueryRow(ctx, `
		INSERT INTO external_idempotency_keys(user_id,idempotency_key,request_hash,method,path)
		VALUES($1,$2,$3,$4,$5)
		ON CONFLICT(user_id,idempotency_key) DO NOTHING
		RETURNING idempotency_key`, userID, key, requestHash, method, path).Scan(&inserted)
	if err == nil {
		return middleware.IdempotencyClaim{Claimed: true}, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return middleware.IdempotencyClaim{}, domainerr.Internal("falha ao registrar idempotência", err)
	}

	var existingHash, existingMethod, existingPath, state string
	var statusCode *int
	var responseBody []byte
	err = r.pool.QueryRow(ctx, `
		SELECT request_hash,method,path,state,status_code,response_body
		FROM external_idempotency_keys WHERE user_id=$1 AND idempotency_key=$2`, userID, key).
		Scan(&existingHash, &existingMethod, &existingPath, &state, &statusCode, &responseBody)
	if err != nil {
		return middleware.IdempotencyClaim{}, domainerr.Internal("falha ao consultar idempotência", err)
	}
	if existingHash != requestHash || existingMethod != method || existingPath != path {
		return middleware.IdempotencyClaim{}, domainerr.Conflict("idempotency_key_reused", "Idempotency-Key já utilizado por outra requisição")
	}
	if state == "COMPLETED" && statusCode != nil {
		return middleware.IdempotencyClaim{Complete: true, StatusCode: *statusCode, ResponseBody: responseBody}, nil
	}
	return middleware.IdempotencyClaim{}, nil
}

func (r *IdempotencyRepository) Complete(ctx context.Context, userID uuid.UUID, key string, statusCode int, responseBody []byte) error {
	result, err := r.pool.Exec(ctx, `
		UPDATE external_idempotency_keys
		SET state='COMPLETED',status_code=$3,response_body=$4,completed_at=now()
		WHERE user_id=$1 AND idempotency_key=$2 AND state='PENDING'`, userID, key, statusCode, responseBody)
	if err != nil {
		return domainerr.Internal("falha ao concluir idempotência", err)
	}
	if result.RowsAffected() != 1 {
		return domainerr.Internal("estado de idempotência inválido", nil)
	}
	return nil
}
