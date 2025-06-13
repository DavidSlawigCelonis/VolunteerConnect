DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE applications
        ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    END IF;
END $$; 