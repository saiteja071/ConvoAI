# ConvoAI

ConvoAI is a full-stack AI chat application powered by Google Gemini 2.5 Flash. It supports multiple chat sessions with real-time streaming responses.

## Tech Stack

**Frontend** — React, Material UI, Axios, Vite

**Backend** — Node.js, Express, MongoDB, JWT, Server-Sent Events (SSE)

## Getting Started

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=7000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL= #deployed frontend url
```

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL= #deployed backend url
```

```bash
npm run dev
```