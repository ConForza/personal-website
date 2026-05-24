# Personal Website Refactor Notes

## Completed refactors

- Added `models/` folder and extracted Mongoose models.
- Added `routes/pages.js` for static page routes.
- Added `routes/concerts.js` for concert listing routes.
- Added `routes/blog.js` for blog listing and individual post routes.
- Added basic route-level error handling for concerts and blog pages.
- Added a 404 response for missing blog posts.
- Added `.env.example` for local setup.
- Extracted Classical Music Database routes into `routes/classicalMusicDatabase.js`
- Fixed Classical Music Database search routes for letter, period, and name.
- Extracted Scales Helper routes into `routes/scalesHelper.js`.
- Simplified `index.js` so it mainly handles setup, route mounting, database connection, and server start.
- Added a custom 404 page.

## Completed admin features

- Added protected admin dashboard.
- Added admin blog post list.
- Added admin blog post creation.
- Added admin blog post editing.
- Added archive/unarchive toggle for blog posts.
- Added one-time admin flash messages.
- Added admin navigation.
- Added basic admin styling.
- Improved admin post action layout.
- Added permanent delete flow for archived posts only.
- Added delete confirmation page.

## Remaining admin improvements

- Add CSRF protection for admin forms.
- Consider stronger password handling for admin login.
- Consider extracting admin navigation into an EJS partial.
- Improve public site styling.
- Review Heroku config vars before deployment.

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

## Current route structure

- `routes/pages.js` — static public pages.
- `routes/concerts.js` — concert listings.
- `routes/blog.js` — blog listing and individual posts.
- Remaining in `index.js`:
  - Classical Music Database routes.
  - Scales Helper routes.

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
