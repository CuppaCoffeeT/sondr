-- Add sort_order for cycling prompts
ALTER TABLE public.prompts ADD COLUMN sort_order INTEGER;

-- Make date columns nullable (cycling logic replaces date-range lookups)
ALTER TABLE public.prompts ALTER COLUMN active_from DROP NOT NULL;
ALTER TABLE public.prompts ALTER COLUMN active_to DROP NOT NULL;

-- Update existing prompt
UPDATE public.prompts
  SET sort_order = 0,
      text = 'What is red to you — and why?'
  WHERE text ILIKE '%red%';

-- Insert remaining 11 prompts
INSERT INTO public.prompts (text, sort_order) VALUES
  ('Your favorite $2 item — what makes it worth more?', 1),
  ('Capture something ordinary that means more than it looks.', 2),
  ('What sparked laughter — and what led up to it?', 3),
  ('Show something small that had a big impact.', 4),
  ('Capture something you almost didn''t notice.', 5),
  ('Show something that changed meaning over time.', 6),
  ('Capture something you wouldn''t normally photograph.', 7),
  ('Show something that doesn''t look important — but is.', 8),
  ('What felt different this time?', 9),
  ('Capture something that surprised you — why?', 10),
  ('Show something out of place — what makes it so?', 11);
