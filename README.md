# Huurly: Streamlining the Rental Process

Welcome to the Huurly project repository. Huurly is a platform designed to simplify the rental process for both landlords and tenants in the Dutch market, focusing on a unique reverse-search model: "Laat De Woning Jou Vinden" (Let The Home Find You).

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Development Environment

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies Used

This project is built with:

- **Frontend:** React, TypeScript, shadcn/ui, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL, Auth, Edge Functions)
- **File Storage:** Cloudflare R2
- **Payments:** Stripe
- **Email Notifications:** Resend

## Build

Before building the project, install the dependencies:

```sh
npm install
```

The application relies on all environment variables defined in `.env.example`. If any of these are missing the site may render a blank page.

## Environment Variables

Copy `.env.example` to `.env` in the project root and provide your own values for the following keys:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
VITE_STRIPE_HUURDER_PRICE_ID=<your-huurder-price-id>
STRIPE_SECRET_KEY=<your-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
VITE_CLOUDFLARE_R2_ENDPOINT=<your-r2-endpoint>
VITE_CLOUDFLARE_R2_ACCESS_KEY=<your-r2-access-key>
VITE_CLOUDFLARE_R2_SECRET_KEY=<your-r2-secret-key>
VITE_CLOUDFLARE_R2_BUCKET=<your-r2-bucket>
```
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` initialize the frontend Supabase client in `src/integrations/supabase/client.ts`.
The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side scripts and edge
functions, including the new `register-user` function that provisions user
profiles after sign up.
`CLOUDFLARE_R2_*` settings configure the Cloudflare R2 client used for file uploads.
Do **not** commit your `.env` file to version control.

## Deployment

This project is configured for deployment on Vercel for the frontend and Supabase Edge Functions for the backend logic. All file storage is handled through Cloudflare R2.

### Vercel Deployment

Set the following environment variables in your Vercel dashboard:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
VITE_STRIPE_PUBLISHABLE_KEY=your_publishable_key
VITE_STRIPE_HUURDER_PRICE_ID=your_price_id

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET=your_bucket_name

# Client-side versions (Vercel will automatically expose VITE_ prefixed vars)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
VITE_CLOUDFLARE_R2_ACCESS_KEY=your_access_key
VITE_CLOUDFLARE_R2_SECRET_KEY=your_secret_key
VITE_CLOUDFLARE_R2_BUCKET=your_bucket_name
```

### Supabase Edge Functions Deployment

Use the Supabase CLI to deploy your Edge Functions:

```bash
supabase functions deploy
```

Ensure your Supabase project is linked and environment variables are set using `supabase secrets set`.

## Stripe Setup

Stripe payment processing is handled via Supabase Edge Functions. Ensure your `.env` file (for local development) and Vercel environment variables (for production) are configured with the correct Stripe keys and webhook secret.

## Database Scripts

The scripts in `src/scripts` interact directly with your Supabase project. They expect the following environment variables to be set before running:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

Place these variables in a `.env` file or export them in your shell so that
`update-db.ts` (uses `SUPABASE_SERVICE_ROLE_KEY`) and `query-roles.ts` (uses
`SUPABASE_PUBLISHABLE_KEY`) can authenticate properly.

## Internationalization

Translations are loaded from `public/locales/<language>/translation.json`. Dutch
(`nl`) is the default language and English (`en`) is provided as an example.

To add a new language:

1. Create a folder `public/locales/<lang>` where `<lang>` is the language code.
2. Copy `translation.json` from another locale and translate the values.
3. Restart the development server so i18next can load the new files.

## License

This project is licensed under the [MIT License](LICENSE).


