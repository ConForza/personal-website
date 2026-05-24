# Personal Website Refactor Notes

## Completed refactors

- Refactored single-file Express app into route and model modules.
- Extracted Mongoose models into `models/`.
- Extracted public/static page routes.
- Extracted concerts routes.
- Extracted blog routes.
- Extracted Classical Music Database routes.
- Extracted Scales Helper routes.
- Added route-level error handling.
- Added custom 404 page.
- Added protected admin dashboard.
- Added admin blog management:
  - list posts
  - create posts
  - edit posts
  - archive/unarchive posts
  - permanently delete archived posts only
- Added flash messages.
- Added admin styling/navigation.
- Switched admin password verification to bcrypt.
- Tightened session cookie settings.
- Checked Heroku config vars.
- Deployed and smoke-tested live site.

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

## Future improvements

- Add CSRF protection to admin forms.
- Add admin login rate limiting.
- Extract admin navigation into an EJS partial.
- Consider richer blog editor support.
- Improve public site CSS.
- Consider MongoDB to PostgreSQL migration separately.

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
