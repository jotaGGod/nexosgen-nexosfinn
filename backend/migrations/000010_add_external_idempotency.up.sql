CREATE TABLE IF NOT EXISTS external_idempotency_keys (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idempotency_key text NOT NULL,
    request_hash text NOT NULL,
    method text NOT NULL,
    path text NOT NULL,
    state text NOT NULL DEFAULT 'PENDING',
    status_code integer,
    response_body bytea,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    PRIMARY KEY (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS external_idempotency_created_idx
    ON external_idempotency_keys (created_at);
