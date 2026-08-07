package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// UserRepository persiste usuarios no PostgreSQL.
type UserRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository cria o repositorio.
func NewUserRepository(db *pgxpool.Pool) repository.UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) error {
	const query = `
		INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)`

	_, err := r.db.Exec(ctx, query,
		user.ID, user.Name, user.Email.String(), user.PasswordHash, user.CreatedAt, user.UpdatedAt)
	return translateError(err, "user_not_found", "usuario nao encontrado")
}

func (r *UserRepository) Update(ctx context.Context, user *entity.User) error {
	const query = `
		UPDATE users
		SET name = $2, email = $3, password_hash = $4, updated_at = $5
		WHERE id = $1`

	tag, err := r.db.Exec(ctx, query,
		user.ID, user.Name, user.Email.String(), user.PasswordHash, user.UpdatedAt)
	if err != nil {
		return translateError(err, "user_not_found", "usuario nao encontrado")
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, "user_not_found", "usuario nao encontrado")
	}
	return nil
}

func (r *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	const query = `
		SELECT id, name, email, password_hash, created_at, updated_at
		FROM users WHERE id = $1`

	return r.scanOne(ctx, query, id)
}

func (r *UserRepository) FindByEmail(ctx context.Context, email vo.Email) (*entity.User, error) {
	const query = `
		SELECT id, name, email, password_hash, created_at, updated_at
		FROM users WHERE email = $1`

	return r.scanOne(ctx, query, email.String())
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email vo.Email) (bool, error) {
	const query = `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)`

	var exists bool
	if err := r.db.QueryRow(ctx, query, email.String()).Scan(&exists); err != nil {
		return false, translateError(err, "user_not_found", "usuario nao encontrado")
	}
	return exists, nil
}

func (r *UserRepository) scanOne(ctx context.Context, query string, args ...any) (*entity.User, error) {
	var (
		user     entity.User
		rawEmail string
	)

	err := r.db.QueryRow(ctx, query, args...).Scan(
		&user.ID, &user.Name, &rawEmail, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, translateError(err, "user_not_found", "usuario nao encontrado")
	}

	email, err := vo.NewEmail(rawEmail)
	if err != nil {
		return nil, err
	}
	user.Email = email

	return &user, nil
}
