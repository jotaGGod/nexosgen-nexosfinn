CREATE TABLE IF NOT EXISTS goals (
    id             UUID PRIMARY KEY,
    user_id        UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name           TEXT        NOT NULL,
    target_amount  BIGINT      NOT NULL CHECK (target_amount > 0),
    current_amount BIGINT      NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    deadline       DATE,
    image_url      TEXT        NOT NULL DEFAULT '',
    icon           TEXT        NOT NULL DEFAULT 'target',
    color          TEXT        NOT NULL DEFAULT '#7C3AED',
    archived       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals (user_id);
