## Project summary

Personal website for garyoshea.co.uk, built with Express, EJS, MongoDB/Mongoose, and deployed on Heroku.

The site includes public pages, blog posts, concert listings, a Classical Music Database app, a Scales Helper app, and a protected admin area for managing blog content.

## Local setup

Install dependencies:

```bash
npm install
```

Running locally:

```bash
npm start
```

## Environment variables

Required variables:

- `MONGO_CONFIG` — MongoDB connection string
- `PORT` — local/dev port, usually `3000`
- `ADMIN_USERNAME` — admin login username
- `ADMIN_PASSWORD_HASH` — bcrypt hash of the admin password
- `SESSION_SECRET` — secret used by `express-session`
- `NODE_ENV` — set to `production` in Heroku

## Admin dashboard

The admin dashboard is available at:

```text
/admin/login
```

## Security notes

Admin passwords are verified using bcrypt hashes stored in environment variables.

Session cookies use:

- `httpOnly`
- `sameSite: "lax"`
- `secure` in production

Future improvements:

- add CSRF protection to admin POST forms
- consider rate limiting admin login
- consider extracting repeated admin layout/navigation into EJS partials
