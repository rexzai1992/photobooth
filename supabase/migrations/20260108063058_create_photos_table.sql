/*
  # Create photos table for photobooth

  1. New Tables
    - `photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `image_data` (text) - Base64 encoded image data
      - `created_at` (timestamptz) - Timestamp when photo was uploaded
      - `printed` (boolean) - Flag to track if photo has been printed

  2. Security
    - Enable RLS on `photos` table
    - Add policy to allow anyone to insert photos (public photobooth)
    - Add policy to allow anyone to view photos (for admin interface)
    - Add policy to allow anyone to update printed status
*/

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_data text NOT NULL,
  created_at timestamptz DEFAULT now(),
  printed boolean DEFAULT false
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert photos"
  ON photos
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view photos"
  ON photos
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update printed status"
  ON photos
  FOR UPDATE
  USING (true)
  WITH CHECK (true);