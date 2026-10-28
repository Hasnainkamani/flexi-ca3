[Uploading README.md…]()
# Finance Tracker

A full-stack personal finance tracker built with React + Vite, Express, and MongoDB.

## Features
- Add, view, and delete income/expense transactions
- Dashboard balance, income, and expense summaries
- Filter transactions by type
- MongoDB persistence with Mongoose
- Responsive interface

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Setup
1. Open a terminal in this folder.
2. Install server packages:
   ```bash
   cd server && npm install
   cp .env.example .env
   ```
3. Put your MongoDB connection string in `server/.env` as `MONGODB_URI`.
4. In one terminal, run the API:
   ```bash
   npm run dev
   ```
5. In another terminal from the project root:
   ```bash
   cd client && npm install && npm run dev
   ```
6. Open the Vite URL shown (usually http://localhost:5173).

API defaults to http://localhost:5000. The Vite dev server proxies `/api` requests to it.

## API
- `GET /api/transactions` — list transactions (`?type=income|expense`)
- `POST /api/transactions` — create transaction
- `DELETE /api/transactions/:id` — delete transaction
- `GET /api/transactions/summary` — totals and recent transactions
- `GET /api/health` — API health

## Security
Do not commit `.env` or real credentials. `.env.example` contains placeholders only.
