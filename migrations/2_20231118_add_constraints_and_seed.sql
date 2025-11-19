-- Migration: add constraints, columns, and seed initial data for the repair shop app

-- 1. Add color column to statuses (if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='statuses' AND column_name='color'
    ) THEN
        ALTER TABLE statuses
        ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#00FF00';
    END IF;
END $$;

-- 2. Prevent deletion of the default 'Pending' status (id = 1)
CREATE OR REPLACE FUNCTION prevent_pending_status_deletion()
RETURNS trigger AS $$
BEGIN
    IF OLD.id = 1 THEN
        RAISE EXCEPTION 'Cannot delete the default Pending status (id = 1).';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_pending_status_deletion ON statuses;
CREATE TRIGGER trg_prevent_pending_status_deletion
BEFORE DELETE ON statuses
FOR EACH ROW EXECUTE FUNCTION prevent_pending_status_deletion();

-- 3. Seed default 'Pending' status (id = 1) if not exists
INSERT INTO statuses (id, name, color)
SELECT 1, 'Pending', '#FF0000'
WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE id = 1);

-- 4. Seed initial admin user (id = 1) if not exists
-- Password hash placeholder (bcrypt hash for 'admin')
INSERT INTO users (id, username, password_hash, permissions)
SELECT 1,
       'admin',
       '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
       '["tasks:create","tasks:edit","tasks:delete","users:edit","users:delete","locations:create","locations:edit","locations:delete","tags:create","tags:edit","tags:delete","deviceTypes:create","deviceTypes:edit","deviceTypes:delete","problemTypes:create","problemTypes:edit","problemTypes:delete","statuses:create","statuses:edit","statuses:delete"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);