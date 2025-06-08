# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a34df531-6d73-49f2-a598-55dce02e8cba

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a34df531-6d73-49f2-a598-55dce02e8cba) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

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

Install all dependencies first:

```sh
npm install
```

Ensure every variable in `.env.example` is set. Missing values can render the site blank. Tests may also fail if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are absent.


## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a34df531-6d73-49f2-a598-55dce02e8cba) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Stripe Setup

This project includes a small Node server for Stripe payment processing.
Create a `.env` file in the project root with your keys:

```env
VITE_STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
STRIPE_SECRET_KEY=<your-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
```

Start the Stripe server alongside the Vite dev server:

```sh
npm run server
```

Then in a separate terminal run:

```sh
npm run dev
```
