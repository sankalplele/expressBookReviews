# Express Book Reviews

## Overview

This project is a simple Express.js API for book data and reviews. It supports user registration, user login, public book queries, and authenticated review creation or deletion.

## Install

1. Open a terminal in the `project/expressBookReviews/final_project` folder.
2. Run:
   ```bash
   npm install
   ```

## Run

Start the server:

```bash
npm start
```

The server listens on port `5000`.

## Endpoints

### Public routes

- `POST /register` — register a new user
- `GET /` — get all books
- `GET /isbn/:isbn` — get a book by ISBN
- `GET /author/:author` — get books by author
- `GET /title/:title` — get books by title
- `GET /review/:isbn` — get reviews for a book

### Authenticated routes

- `POST /customer/login` — login and create session token
- `PUT /customer/auth/review/:isbn` — add or update review for a book
- `DELETE /customer/auth/review/:isbn` — delete your review for a book

## Notes

- Use JSON body for registration, login, and adding reviews.
- The login session is stored with `express-session`.
- When adding a review, the server stores the review under your username.
