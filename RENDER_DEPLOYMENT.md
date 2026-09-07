# Deploying WaitFree Clinic to Render (Docker Unified)

This repository is configured to deploy both the **React (Vite) Frontend** and **Flask Backend** together in a single **Docker container** on [Render](https://render.com).

---

## Why Single Docker Container?

1. **One-Click Hosting**: Everything is bundled into one service — no need to manage multiple hosts.
2. **Zero CORS Issues**: Frontend and Backend share the same domain and port (`/api/health`, `/search`, etc. are relative same-origin URLs).
3. **Cost Effective**: Runs completely within Render's Free tier (1 free web service).

---

## Deployment Instructions

### Method 1: One-Click Deploy via Render Blueprint (Recommended)

1. Push your project to **GitHub** or **GitLab**:
   ```bash
   git add .
   git commit -m "Configure unified Docker container for Render"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top right and select **Blueprint**.
4. Connect your repository.
5. Render will automatically read [`render.yaml`](./render.yaml).
6. Provide the environment variables prompted on the screen:
   - **`FIREBASE_CREDENTIALS_JSON`**: Open your local `Backend/serviceAccountKey.json`, copy the entire JSON content, and paste it into this field.
   - **`STRIPE_*`**: Copy your Stripe keys from your local `Backend/.env`.
   - **`SMTP_*`**: Copy your email credentials from your local `Backend/.env`.
7. Click **Apply**. Render will build the Docker container and deploy!

---

### Method 2: Manual Web Service Setup on Render

If you prefer setting up the Web Service manually:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the following:
   - **Name**: `waitfree-clinic` (or any name you like)
   - **Region**: Choose the closest region (e.g. Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Runtime**: **`Docker`**
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: **Free**
4. Under **Health Check Path**, enter:
   `/api/health`
5. Under **Environment Variables**, add:
   - `PORT`: `10000`
   - `FIREBASE_CREDENTIALS_JSON`: *(Paste the complete contents of `Backend/serviceAccountKey.json` here)*
   - `STRIPE_SECRET_KEY`: *(From `Backend/.env`)*
   - `STRIPE_PUBLISHABLE_KEY`: *(From `Backend/.env`)*
   - `STRIPE_WEBHOOK_SECRET`: *(From `Backend/.env`)*
   - `STRIPE_BASIC_MONTHLY_PRICE_ID`: *(From `Backend/.env`)*
   - `STRIPE_BASIC_YEARLY_PRICE_ID`: *(From `Backend/.env`)*
   - `STRIPE_PREMIUM_MONTHLY_PRICE_ID`: *(From `Backend/.env`)*
   - `STRIPE_PREMIUM_YEARLY_PRICE_ID`: *(From `Backend/.env`)*
   - `STRIPE_PRO_MONTHLY_PRICE_ID`: *(From `Backend/.env`)*
   - `STRIPE_PRO_YEARLY_PRICE_ID`: *(From `Backend/.env`)*
   - `SMTP_SERVER`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USERNAME`: `sujalgawas18@gmail.com`
   - `SMTP_PASSWORD`: *(From `Backend/.env`)*
   - `FRONTEND_URL`: `https://<your-render-app-name>.onrender.com`
6. Click **Create Web Service**.

> [!IMPORTANT]
> **How to Add Firebase Credentials on Render (Choose Any 1 of 2 Methods)**:
>
> **Method A (Easiest & Recommended: Secret File)**:
> 1. In the Render Dashboard, go to your service.
> 2. Click the **Environment** tab on the left.
> 3. Scroll down to **Secret Files** and click **Add Secret File**.
> 4. Filename: `serviceAccountKey.json`
> 5. Upload or paste the contents of `Backend/serviceAccountKey.json`.
> 6. Click **Save Changes**. The backend automatically detects `/etc/secrets/serviceAccountKey.json`!
>
> **Method B (Environment Variable)**:
> 1. Under **Environment Variables**, add:
>    - Key: `FIREBASE_CREDENTIALS_JSON`
>    - Value: Paste the contents of `Backend/serviceAccountKey.json` (or the Base64 string).
> 2. Click **Save Changes**.

---

## How It Works Under the Hood

1. **Stage 1 (Node 20)**: Installs npm packages and runs `npm run build`, producing an optimized production bundle in `dist/`.
2. **Stage 2 (Python 3.11)**:
   - Installs backend dependencies from `Backend/requirements.txt` (including `gunicorn`).
   - Copies backend Python code.
   - Copies `dist/` into `/app/frontend_dist`.
   - Starts **Gunicorn** on `0.0.0.0:${PORT:-10000}` with 2 workers and 4 threads.
3. **Routing**:
   - `/api/health` -> Healthcheck endpoint (returns 200 OK JSON).
   - `/assets/*` and static files -> Served directly by Flask.
   - SPA routes (`/`, `/search`, `/doctor-schedule`, `/Pricing`, etc.) -> Serves `index.html` allowing React Router to render client-side routes.
   - API endpoints (`/search` [POST], `/verify-token`, `/doctor/*`, `/scheduler/*`, etc.) -> Handled by Flask blueprints.
