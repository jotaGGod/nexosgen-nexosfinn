DROP INDEX IF EXISTS transactions_user_settlement_date_idx;

ALTER TABLE transactions
    DROP COLUMN IF EXISTS settled_at,
    DROP COLUMN IF EXISTS is_settled;
