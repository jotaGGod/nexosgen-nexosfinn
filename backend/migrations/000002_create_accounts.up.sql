CREATE TABLE IF NOT EXISTS accounts (
    id              UUID PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name            TEXT        NOT NULL,
    type            TEXT        NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'cash', 'investment')),
    -- Saldo inicial em centavos. O saldo corrente e sempre derivado:
    -- initial_balance + somatorio das transacoes da conta.
    initial_balance BIGINT      NOT NULL DEFAULT 0,
    color           TEXT        NOT NULL DEFAULT '#7C3AED',
    icon            TEXT        NOT NULL DEFAULT 'wallet',
    archived        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS accounts_user_id_name_key ON accounts (user_id, lower(name));
