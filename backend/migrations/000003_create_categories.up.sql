CREATE TABLE IF NOT EXISTS categories (
    id         UUID PRIMARY KEY,
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    type       TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
    color      TEXT        NOT NULL DEFAULT '#7C3AED',
    icon       TEXT        NOT NULL DEFAULT 'tag',
    archived   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_id_name_type_key
    ON categories (user_id, lower(name), type);
