CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY,
    name          TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- E-mails sao normalizados para minusculas no value object Email,
-- por isso um indice unico simples e suficiente.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email);
