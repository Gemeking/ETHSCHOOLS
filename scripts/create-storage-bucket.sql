-- Run this in your Supabase SQL Editor BEFORE uploading images
-- Project: jkvonmowcpmomoafazmc

-- 1. Create the storage bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  10485760,  -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- 2. Allow anyone to read images (public bucket)
drop policy if exists "Public read images" on storage.objects;
create policy "Public read images"
  on storage.objects for select
  using (bucket_id = 'images');

-- 3. Allow authenticated + anon upload (admin uses anon key)
drop policy if exists "Allow image uploads" on storage.objects;
create policy "Allow image uploads"
  on storage.objects for insert
  with check (bucket_id = 'images');

-- 4. Allow delete
drop policy if exists "Allow image deletes" on storage.objects;
create policy "Allow image deletes"
  on storage.objects for delete
  using (bucket_id = 'images');

-- 5. Allow update (for upsert operations)
drop policy if exists "Allow image updates" on storage.objects;
create policy "Allow image updates"
  on storage.objects for update
  using (bucket_id = 'images');
