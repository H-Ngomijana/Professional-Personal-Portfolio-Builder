CREATE TABLE public.portfolio_inquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 email text NOT NULL,
 company text NOT NULL DEFAULT '',
 message text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.portfolio_inquiries TO service_role;
ALTER TABLE public.portfolio_inquiries ENABLE ROW LEVEL SECURITY;
CREATE INDEX portfolio_inquiries_email_created_idx ON public.portfolio_inquiries(email, created_at);