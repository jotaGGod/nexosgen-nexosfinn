CREATE TABLE IF NOT EXISTS api_keys (
    id           UUID PRIMARY KEY,
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name         TEXT        NOT NULL,
    -- Parte visivel da chave, exibida na listagem (ex.: fin_live_ab12cdef).
    prefix       TEXT        NOT NULL,
    -- SHA-256 do segredo completo. A chave em texto puro nunca e persistida.
    key_hash     TEXT        NOT NULL,
    scopes       TEXT[]      NOT NULL DEFAULT '{}',
    expires_at   TIMESTAMPTZ,
    revoked_at   TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS api_keys_key_hash_key ON api_keys (key_hash);
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys (user_id);
