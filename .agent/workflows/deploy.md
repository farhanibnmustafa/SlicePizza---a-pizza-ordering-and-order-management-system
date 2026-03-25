---
description: How to deploy SlicePizza to Vercel
---

Deploying SlicePizza to Vercel is the recommended way to go live. Follow these steps for a successful enterprise-grade deployment:

### 1. Push to GitHub
Ensure all your changes are committed and pushed to a private GitHub repository.

### 2. Create Vercel Project
- Log in to [Vercel](https://vercel.com).
- Click **"Add New"** > **"Project"**.
- Import your **SlicePizza** repository.

### 3. Configure Environment Variables
Copy the following keys exactly as they appear in your `.env.local`:

| Key | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **(Critical)** Your Supabase private key |
| `AUTH_SECRET` | A secure random string for Auth.js |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Your Facebook app credentials |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From your Stripe Dashboard |
| `STRIPE_SECRET_KEY` | From your Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Generate this in Step 4 |
| `ADMIN_EMAILS` | Comma-separated list of admin emails |

### 4. Finalize Stripe & Webhooks
Once your project is live (e.g., `slice-pizza.vercel.app`):
1. Go to your **Stripe Dashboard** > **Developers** > **Webhooks**.
2. Add a new endpoint: `https://your-app.vercel.app/api/webhooks/stripe`.
3. Select the event: `checkout.session.completed`.
4. Copy the "Signing Secret" and update your Vercel `STRIPE_WEBHOOK_SECRET` variable.

### 5. Finalize Supabase Config
- In Supabase > **Settings** > **API**, ensure `next_auth` is in the **Exposed schemas** list.
- In Supabase > **Authentication** > **URL Configuration**, add your Vercel URL to the **Redirect URLs**.

### 6. Verify Deployment
- Visit your Vercel URL.
- Try logging in with Facebook.
- Place a test order to verify the Stripe callback!

---
// turbo-all
