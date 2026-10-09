CREATE TABLE public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(title) BETWEEN 2 AND 100),
  category text NOT NULL CHECK (length(category) BETWEEN 2 AND 80),
  image_url text NOT NULL,
  alt text NOT NULL CHECK (length(alt) BETWEEN 5 AND 250),
  tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL CHECK (length(description) BETWEEN 10 AND 500),
  details text NOT NULL CHECK (length(details) BETWEEN 10 AND 2000),
  href text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portfolio_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 2 AND 80),
  role text NOT NULL CHECK (length(role) BETWEEN 2 AND 80),
  note text NOT NULL CHECK (length(note) BETWEEN 2 AND 180),
  icon_slug text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portfolio_projects, public.portfolio_tools TO anon, authenticated;
GRANT ALL ON public.portfolio_projects, public.portfolio_tools TO service_role;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY published_projects_read ON public.portfolio_projects
  FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY published_tools_read ON public.portfolio_tools
  FOR SELECT TO anon, authenticated USING (published);

ALTER TABLE public.portfolio_inquiries
  DROP CONSTRAINT IF EXISTS portfolio_inquiries_package_id_fkey;
ALTER TABLE public.portfolio_inquiries
  ADD CONSTRAINT portfolio_inquiries_package_id_fkey
  FOREIGN KEY (package_id) REFERENCES public.developer_packages(id) ON DELETE SET NULL;

INSERT INTO public.portfolio_projects
  (title, category, image_url, alt, tags, description, details, href, published)
VALUES
  ('Arena X', 'Esports platform', '/projects/arena-x.png', 'Arena X esports platform interface',
   ARRAY['React', 'Competition UX', 'Platform'],
   'A competitive esports platform for matches, teams, discovery, and online tournament energy.',
   'Arena X focuses on high-intensity navigation, clear player journeys, and a digital product feel built for gaming communities that need action, trust, and speed.',
   'https://arena-x-esport-platform.vercel.app/', true),
  ('Les Arsene', 'Brand website', '/projects/les-arsene.png', 'Les Arsene website preview',
   ARRAY['Website', 'Brand system', 'Responsive'],
   'A polished public website shaped around brand presence, clarity, and fast browsing.',
   'The experience balances an elegant visual rhythm with practical content structure so visitors can understand the brand quickly and move through the site without friction.',
   'http://lesarsene.rw/', true),
  ('CJ Flix', 'Streaming experience', '/projects/cj-flix.png', 'CJ Flix streaming platform preview',
   ARRAY['Entertainment', 'Catalog UX', 'Netlify'],
   'A streaming-style interface designed for browsing media with a clean and cinematic feel.',
   'CJ Flix uses familiar media patterns, strong hierarchy, and fast content scanning to make the platform feel natural for viewers from the first click.',
   'https://cj-flix.netlify.app/', true),
  ('Micorp', 'Business platform', '/projects/micorp.png', 'Micorp professional platform preview',
   ARRAY['Corporate UX', 'Web app', 'Conversion'],
   'A professional business platform with sharp presentation and direct service discovery.',
   'Micorp is built around credibility: focused pages, confident calls to action, and a layout that supports both exploration and conversion.',
   'https://micorp.pro/', true);

INSERT INTO public.portfolio_tools (name, role, note, icon_slug, published)
VALUES
  ('JavaScript', 'Language', 'interactive product logic', 'javascript', true),
  ('TypeScript', 'Language', 'stable scalable code', 'typescript', true),
  ('React', 'Frontend', 'smooth app interfaces', 'react', true),
  ('HTML5', 'Markup', 'accessible structure', 'html5', true),
  ('CSS', 'Styling', 'responsive systems', 'css', true),
  ('Python', 'Language', 'automation and APIs', 'python', true),
  ('Node.js', 'Runtime', 'server workflows', 'nodedotjs', true),
  ('Docker', 'DevOps', 'containers and delivery', 'docker', true),
  ('Tailwind CSS', 'Styling', 'design implementation', 'tailwindcss', true),
  ('Git', 'Version control', 'clean collaboration', 'git', true),
  ('Figma', 'Design', 'interface planning', 'figma', true),
  ('NestJS', 'Backend', 'structured server applications', 'nestjs', true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-projects',
  'portfolio-projects',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY portfolio_project_images_read ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio-projects');
