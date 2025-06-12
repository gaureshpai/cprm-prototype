# Setup Guide for Aakar2025

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Process](#setup-process)
- [Environment Configuration](#environment-configuration)
- [Common Errors and Troubleshooting](#common-errors-and-troubleshooting)
- [Conclusion](#conclusion)

## Overview

This guide helps you set up the **Aakar2025** built using **Next.js** with **Supabase** for backend and **OAuth mailing support**. It includes detailed steps and troubleshooting tips for a smooth development setup.

## Prerequisites

Ensure the following tools are installed:

- ✅ [Git](https://git-scm.com/downloads)
- ✅ [Node.js (LTS)](https://nodejs.org/)
- ✅ [Visual Studio Code](https://code.visualstudio.com/download)
- ✅ A GitHub account ([sign up here](https://github.com/join))
- ✅ Optional: [Postman](https://www.postman.com/) for API testing

## Setup Process

1. **Clone the Repository**
   ```bash
   git clone https://github.com/aakar2025/aakar2025.git
   cd aakar2025
   ```

2. **Install Node Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment File**
   Copy the example env file and update it:
   ```bash
   cp example.env .env.local
   ```

4. **Configure Your Supabase & Auth Details**  
   Add the following in `.env.local`:

   ```env
    NEXT_PUBLIC_SUPABASE_URL=https://abcde12345.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...FAKE_KEY...eXAiOiJKV1Q
    AUTH_SECRET="randomlyGeneratedSecretKey=="
    MAIL_USER=test@example.com
    MAIL_CLIENT_ID=1234567890-fakeclientid.apps.googleusercontent.com
    MAIL_CLIENT_SECRET=FAKE_CLIENT_SECRET_123456
    MAIL_ACCESS_TOKEN=ya29.fakeAccessToken123456789
    MAIL_REFRESH_TOKEN=1//fakeRefreshToken123456789
    NODE_ENV="development"
    DATABASE_URL="postgresql://user:password@db.example.com/dbname?sslmode=require"

   ```

   > ✅ **Note**: Do **not** share your Supabase or Mail secrets publicly.

5. **Run the App Locally**
   ```bash
   npm run dev
   ```

   App will be available at `http://localhost:3000`.

## Environment Configuration

Here’s a breakdown of important environment variables:

| Variable | Description |
|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `AUTH_SECRET` | Used for encrypting cookies/sessions |
| `MAIL_USER` | Email used for sending mail (OAuth2) |
| `MAIL_CLIENT_ID` | Google OAuth client ID (used with Gmail API) |

## Common Errors and Troubleshooting

<details>
<summary>Expand to view common issues</summary>

- **Error: `.env.local not loaded`**
  - Ensure your `.env.local` file exists and matches the required variable names.

- **Supabase Auth not working**
  - Make sure Supabase authentication is enabled and configured in the Supabase project dashboard.

- **Port already in use**
  - Kill the running process:
    ```bash
    lsof -i :3000
    kill -9 <PID>
    ```

- **Mail Not Sending**
  - Check that OAuth credentials are correct and allow less secure apps access in Google.
  - Double-check your `.env.local` has no trailing whitespaces or broken strings.

- **“Module not found” Errors**
  - Run a clean install:
    ```bash
    rm -rf node_modules
    npm install
    ```

- **Deployment on Vercel**
  - Add all environment variables to the Vercel dashboard under Project → Settings → Environment Variables.

</details>

## Conclusion

You're now all set to work with **Aakar2025**!  
If you encounter additional issues, feel free to open an issue on the GitHub repo or contact the maintainer.

Happy Building 🚀