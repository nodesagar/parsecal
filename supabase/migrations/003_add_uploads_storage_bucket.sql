-- Create uploads bucket and enforce per-user folder access.
-- Files are stored at: {user_id}/{session_id}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/heic'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'uploads_select_own'
  ) THEN
    CREATE POLICY uploads_select_own
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'uploads_insert_own'
  ) THEN
    CREATE POLICY uploads_insert_own
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'uploads_update_own'
  ) THEN
    CREATE POLICY uploads_update_own
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'uploads_delete_own'
  ) THEN
    CREATE POLICY uploads_delete_own
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
