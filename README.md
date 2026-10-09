# Smooth Portfolio Builder

build the same fullstack transitional portfolio website same as the video i uploaded ... with full deatils and smooth transitions ... navbar behavior , page behavior , real icons and so on

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/055efedc-08ff-49d2-9f27-4fb206b8321f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Owner studio

The private owner workspace is available at `/auth` and `/admin`. Configure these
values in the server environment before signing in:

- `ADMIN_USERNAME` and `ADMIN_PASSWORD` for the owner login.
- `ADMIN_SESSION_SECRET` as a random secret of at least 32 bytes for signing the
  eight-hour, HTTP-only session cookie.
- `SUPABASE_URL` and either `SUPABASE_SERVICE_ROLE_KEY` (legacy service-role
  key) or `SUPABASE_SECRET_KEY` (new Supabase secret key) for private owner
  operations and project-image uploads.
- `SUPABASE_PUBLISHABLE_KEY` for loading published content on the public site.

Keep the service-role key and admin credentials server-only; never use a
`VITE_`-prefixed variable for them. The Supabase project must have the
`developer_packages`, `portfolio_inquiries`, `portfolio_projects`, and
`portfolio_tools` tables from the migrations in `drizzle/migrations`. Keep
inquiry reads restricted to the service role. The owner workspace can publish
packages, projects, and tools; project images are uploaded to the public
`portfolio-projects` storage bucket. New public content refreshes automatically,
and the inbox checks for new inquiries every three seconds while open. Direct
email links open a message to `huguesblessy@gmail.com`; inquiry submissions are
stored in the private dashboard and are not sent as email until an email
provider is configured.

Local dev reads server-only values from `.env` and `.env.local`. Set the same
values as server-side secrets in Lovable Cloud for a deployed preview; local
files are not published with the site. Find a Supabase secret key in the
Supabase dashboard under **Project Settings → API Keys**. Add it in Lovable
Cloud's server-side secrets as `SUPABASE_SECRET_KEY` (or use the legacy
`SUPABASE_SERVICE_ROLE_KEY` name). Never put either key in client-exposed
`VITE_*` variables.

Apply `drizzle/migrations/0000_create_portfolio_inquiries.sql`,
`drizzle/migrations/0001_portfolio_owner_packages.sql`, and
`drizzle/migrations/0002_live_portfolio_content.sql` in order to the connected
Supabase project before using the studio. The admin workspace at `/admin` lets
the owner create, edit, publish, and delete packages and prices, projects and
their uploaded images, and technology tools. It also provides a searchable
inbox for recent inquiries.
