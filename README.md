# Healthcare App (Universal Structure)

This repository is split into independent frontend and backend applications.

## Project Structure

- `frontend/` - React + Vite client
- `backend/` - Node.js + Express API
- `package.json` (root) - run scripts for both apps

## Install

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Run

```bash
npm run dev
```

This starts both frontend and backend together.

## Individual Commands

```bash
npm start
npm run frontend
npm run backend
npm run build
npm run lint
npm run test:backend
npm run verify
```

## API

- Base URL: `http://localhost:8005/api/v1`
- Auth: cookie-based JWT with role-aware guards
- Records uploads: stored locally in `backend/uploads`
