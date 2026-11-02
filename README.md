# Library Management API

Simple Node.js and Express REST API. Books are kept in a JavaScript array, so data resets when the server restarts.

## Run

```bash
npm install
npm start
```

Server: `http://localhost:3000` (set `PORT` to change it).

## Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/books` | Add a book |
| GET | `/api/books` | List books; optional search: `?q=java` |
| GET | `/api/books/:id` | Get one book |
| PUT | `/api/books/:id` | Update book details (ID stays unchanged) |
| DELETE | `/api/books/:id` | Delete a book |
| POST | `/api/books/:id/issue` | Issue one copy |
| POST | `/api/books/:id/return` | Return one copy |

Example request body:

```json
{"id":"101","title":"Java Programming","author":"Herbert Schildt","category":"Programming","quantity":5,"available":5}
```

`id`, `title`, `author`, and `category` are required. Quantity and available must be non-negative whole numbers, and available cannot exceed quantity. If `available` is omitted when adding a book, it defaults to `quantity`.
