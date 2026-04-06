# Platr — Order Management System

> Restaurant order system (API + planned client) designed to streamline service and improve efficiency.

## Overview

Platr is a lightweight restaurant order management system focused on speeding up service flow and making order handling predictable for kitchen and front-of-house staff. This repository currently contains the API and the SQL schema used to bootstrap the database; a client (frontend) will be added in a future iteration.

## Key features

- Create, update and track orders
- Manage menu items and categories
- Simple authentication and role-aware endpoints (server depends on `jsonwebtoken`)
- Designed to be extended: controllers, routes and middlewares are separated for clarity

## Architecture & file layout

Relevant paths in this repository:

- `api/` — backend API code
  - `api/src/server.js` — main server entrypoint (referenced by `package.json` scripts)
  - `api/src/controllers/` — request handlers
  - `api/src/routes/` — HTTP routes
  - `api/src/middlewares/` — express middlewares
- `database/` — database artifacts and design details
  - `database/database.sql` — SQL schema and seed (run to create schema)
  - `database/erd.mwb` — ERD source file
- `client/` — frontend 

## Tech stack

- Node.js (JavaScript, ESM)
- Express
- MySQL driver (`mysql2`)
- JSON Web Tokens for auth (`jsonwebtoken`)

Notes: the project currently lists `mysql2` as a dependency in `api/package.json`, so the default database target is MySQL/MariaDB. If you prefer PostgreSQL, swap the driver and update the SQL accordingly.


## Database

The SQL schema is available at `database/database.sql`. It contains table definitions and (optionally) seed statements used by the app. The ERD file `database/erd.mwb` is included as the visual design source.

## Developed by Group 9

Contributors include: 

1. Shimwa Aime Kelvin (Group Representative)
2. mwizerwa Achille Rigobert
3. Imena Benjamin
4. Ice Perla
5. Ikaze Annick
6. Kanyana Belinda
7. Rumanzi bright King
8. Mugabekazi Alice

