# Huurly: Streamlining the Rental Process

Welcome to the Huurly project repository. Huurly is a platform designed to simplify the rental process for both landlords and tenants.

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

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Build and Test

Before building the project or running tests, install the dependencies:

```sh
npm install
```


The application relies on all environment variables defined in `.env.example`. If any of these are missing the site may render a blank page. Tests can also fail when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are not provided.

## Environment Variables

Copy `.env.example` to `.env` in the project root and provide your own values for the following keys:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
STRIPE_SECRET_KEY=<your-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```
The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side scripts and edge
functions, including the new `register-user` function that provisions user
profiles after sign up.
Do **not** commit your `.env` file to version control.


## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a34df531-6d73-49f2-a598-55dce02e8cba) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Stripe Setup

Stripe payment processing is handled via Supabase Edge Functions.
Create a `.env` file in the project root with your keys:

```env
VITE_STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
STRIPE_SECRET_KEY=<your-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

Run the Vite dev server with:

```sh
npm run dev
```


## Database Scripts

The scripts in `src/scripts` interact directly with your Supabase project. The former `seedDatabase.ts` utility has been removed, so only administrative scripts remain. They expect the following environment variables to be set before running:

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
