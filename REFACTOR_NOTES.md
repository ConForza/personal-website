# Personal Website Refactor Notes

## Current app summary

Express/EJS personal website for garyoshea.co.uk.

Current stack:

- Node.js
- Express
- EJS
- MongoDB via Mongoose
- Axios
- Heroku deployment

## Current entry point

- `index.js`

Currently contains:

- Express app setup
- MongoDB connection
- Mongoose schemas/models
- Page routes
- Blog routes
- Concert routes
- Classical Music Database app routes
- Scales Helper app routes

## Current environment variables

- `MONGO_CONFIG` — MongoDB connection string
- `PORT` — provided by Heroku in production

## Current database models

### Concert

Fields:

- `date`
- `venue`
- `repertoire`
- `notes`

### Blog

Fields:

- `date`
- `title`
- `content`
- `archived`

### Scale

Fields:

- `type`
- `name`
- `group`
- `grades`
- `link`

## Current routes

### Main pages

- `GET /`
- `GET /about`
- `GET /concerts`
- `GET /repertoire`
- `GET /research`
- `GET /blog`
- `GET /posts/:post`
- `GET /contact`
- `GET /apps`

### Classical Music Database

- `GET /apps/classical-music-database/`
- `POST /cmd/submit`
- `POST /cmd/submit-essential`
- `POST /cmd/search-by-letter`
- `GET /cmd/biog/:id`

### Scales Helper

- `GET /apps/scales-helper`
- `POST /apps/scales-helper`

## Current issues

- `index.js` does too much.
- Routes, schemas, models, and business logic are all mixed together.
- No admin interface.
- Blog posts currently require direct database editing.
- No clear route separation.
- No `.env.example`.
- No README setup instructions.
- MongoDB is used currently; PostgreSQL migration can be considered later.
- Admin authentication needs adding before editing content through the site.

## Planned improvements

### Phase 1 — Safe refactor

- Move Mongoose models into separate files.
- Move route groups into `routes/`.
- Keep existing views and behaviour unchanged.
- Add `.env.example`.
- Improve README.

### Phase 2 — Admin dashboard

- Add admin login.
- Add protected admin routes.
- Add blog post create/edit/archive forms.
- Add logout.
- Keep admin credentials in environment variables initially.

### Phase 3 — CSS redesign

- Improve layout consistency.
- Improve typography.
- Improve blog/post pages.
- Improve mobile responsiveness.
- Improve admin dashboard styling.

### Phase 4 — Database migration consideration

- Decide whether to keep MongoDB or migrate to PostgreSQL.
- If migrating, design relational schema first.
