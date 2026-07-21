CREATE TABLE IF NOT EXISTS transactions (
    id          UUID PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    account_id  UUID        NOT NULL REFERENCES accounts (id) ON DELETE RESTRICT,
    category_id UUID        NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    type        TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
    -- Sempre positivo, em centavos. O sinal e dado pelo campo type.
    amount      BIGINT      NOT NULL CHECK (amount > 0),
    description TEXT        NOT NULL,
    notes       TEXT        NOT NULL DEFAULT '',
    occurred_on DATE        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions (user_id, occurred_on DESC);
CREATE INDEX IF NOT EXISTS transactions_user_category_idx ON transactions (user_id, category_id);
CREATE INDEX IF NOT EXISTS transactions_user_account_idx ON transactions (user_id, account_id);
