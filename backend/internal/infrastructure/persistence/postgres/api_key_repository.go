package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

const apiKeyNotFoundCode = "api_key_not_found"
const apiKeyNotFoundMessage = "chave de API nao encontrada"

// APIKeyRepository persiste as credenciais de integracao no PostgreSQL.
type APIKeyRepository struct {
	db *pgxpool.Pool
}

// NewAPIKeyRepository cria o repositorio.
func NewAPIKeyRepository(db *pgxpool.Pool) repository.APIKeyRepository {
	return &APIKeyRepository{db: db}
}

func (r *APIKeyRepository) Create(ctx context.Context, key *entity.APIKey) error {
	const query = `
		INSERT INTO api_keys (id, user_id, name, prefix, key_hash, scopes, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.db.Exec(ctx, query,
		key.ID, key.UserID, key.Name, key.Prefix, key.KeyHash,
		vo.ScopesToStrings(key.Scopes), key.ExpiresAt, key.CreatedAt)
	return translateError(err, apiKeyNotFoundCode, apiKeyNotFoundMessage)
}

func (r *APIKeyRepository) ListByUser(ctx context.Context, userID uuid.UUID) ([]*entity.APIKey, error) {
	const query = `
		SELECT id, user_id, name, prefix, key_hash, scopes, expires_at, revoked_at, last_used_at, created_at
		FROM api_keys WHERE user_id = $1
		ORDER BY revoked_at NULLS FIRST, created_at DESC`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, translateError(err, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}
	defer rows.Close()

	keys := make([]*entity.APIKey, 0)
	for rows.Next() {
		key, err := scanAPIKey(rows)
		if err != nil {
			return nil, err
		}
		keys = append(keys, key)
	}
	return keys, translateError(rows.Err(), apiKeyNotFoundCode, apiKeyNotFoundMessage)
}

func (r *APIKeyRepository) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.APIKey, error) {
	const query = `
		SELECT id, user_id, name, prefix, key_hash, scopes, expires_at, revoked_at, last_used_at, created_at
		FROM api_keys WHERE id = $1 AND user_id = $2`

	rows, err := r.db.Query(ctx, query, id, userID)
	if err != nil {
		return nil, translateError(err, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}
	return scanAPIKey(rows)
}

func (r *APIKeyRepository) FindByHash(ctx context.Context, keyHash string) (*entity.APIKey, error) {
	const query = `
		SELECT id, user_id, name, prefix, key_hash, scopes, expires_at, revoked_at, last_used_at, created_at
		FROM api_keys WHERE key_hash = $1`

	rows, err := r.db.Query(ctx, query, keyHash)
	if err != nil {
		return nil, translateError(err, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}
	return scanAPIKey(rows)
}

func (r *APIKeyRepository) Revoke(ctx context.Context, key *entity.APIKey) error {
	const query = `UPDATE api_keys SET revoked_at = $3 WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, key.ID, key.UserID, key.RevokedAt)
	if err != nil {
		return translateError(err, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}
	return nil
}

func (r *APIKeyRepository) TouchLastUsed(ctx context.Context, key *entity.APIKey) error {
	const query = `UPDATE api_keys SET last_used_at = $2 WHERE id = $1`

	_, err := r.db.Exec(ctx, query, key.ID, key.LastUsedAt)
	return translateError(err, apiKeyNotFoundCode, apiKeyNotFoundMessage)
}

func scanAPIKey(rows pgx.Rows) (*entity.APIKey, error) {
	var (
		key       entity.APIKey
		rawScopes []string
		expires   *time.Time
		revoked   *time.Time
		lastUsed  *time.Time
	)

	if err := rows.Scan(
		&key.ID, &key.UserID, &key.Name, &key.Prefix, &key.KeyHash,
		&rawScopes, &expires, &revoked, &lastUsed, &key.CreatedAt,
	); err != nil {
		return nil, translateError(err, apiKeyNotFoundCode, apiKeyNotFoundMessage)
	}

	key.Scopes = make([]vo.Scope, 0, len(rawScopes))
	for _, raw := range rawScopes {
		key.Scopes = append(key.Scopes, vo.Scope(raw))
	}
	key.ExpiresAt = expires
	key.RevokedAt = revoked
	key.LastUsedAt = lastUsed

	return &key, nil
}
