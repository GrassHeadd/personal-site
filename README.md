# personal-site

JJ's corner of the internet: [junjiehu.com](https://junjiehu.com). Part portfolio,
part notebook, eventually a whole brain.

## Layout

```
web/         the site: Next.js app deployed on Vercel (Root Directory = web)
             - pages: home, /talkerinos (blog), /calendar, /projects
             - backend: serverless route handlers in src/app/api
               (blog CRUD + AI editor chat), backed by Supabase Postgres
braindump/   voice-first personal knowledge OS (Python/FastAPI). In progress,
             not deployed; will feed the notes garden / calendar / workflows.
```

## Develop

```bash
cd web
npm install
cp .env.local.example .env.local   # fill in Supabase / EmailJS / OpenAI keys
npx next dev
```

## Deploy

Push to `main`; Vercel builds `web/`. Secrets live in Vercel env vars
(`SUPABASE_URL`, `SUPABASE_KEY`, `BLOG_API_KEY`, `OPENAI_API_KEY`,
`NEXT_PUBLIC_EMAILJS_*`).

## History

The blog API was once a Go service (`talkerinos`) on Render; it was ported to
Next.js route handlers in June 2026. The Go code's full history is in this
repo's git log and in the archived GrassHeadd/talkerinos repo.
