CREATE TABLE IF NOT EXISTS budgets (
    id           UUID PRIMARY KEY,
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id  UUID        NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    -- Primeiro dia do mes de referencia do orcamento.
    month        DATE        NOT NULL,
    limit_amount BIGINT      NOT NULL CHECK (limit_amount > 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_category_month_key
    ON budgets (user_id, category_id, month);
