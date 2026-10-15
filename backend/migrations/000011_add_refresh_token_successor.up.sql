ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS replaced_by UUID NULL REFERENCES refresh_tokens(id) ON DELETE SET NULL;
