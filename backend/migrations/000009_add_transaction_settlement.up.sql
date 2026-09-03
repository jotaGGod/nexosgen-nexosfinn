-- Liquidação não é inferida da data: um lançamento passado pode continuar
-- pendente e um futuro pode ter sido liquidado antecipadamente. Registros
-- legados recebem false por segurança, pois não há histórico confiável.
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS is_settled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS settled_at DATE NULL;

CREATE INDEX IF NOT EXISTS transactions_user_settlement_date_idx
    ON transactions (user_id, is_settled, occurred_on DESC);
