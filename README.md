# RiseRoutes AI Ads Intelligence Platform

An AI-powered platform that analyzes websites and competitors to generate actionable Meta and Google Ads targeting recommendations.

## Features

- **Website Analysis**: Extract business model, value propositions, and audience insights from any website
- **Competitor Intelligence**: Analyze competitor strategies and identify market opportunities
- **AI-Powered Targeting**: Generate Meta and Google Ads recommendations with confidence scores
- **Export & Sharing**: Export targeting data in platform-ready formats
- **Premium Dashboard**: Intuitive interface with zero learning curve

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for state management
- Vite for build tooling

### Backend
- Node.js with Express.js
- TypeScript for type safety
- MySQL 8.0 for data storage
- Redis for caching and sessions
- Bull Queue for background jobs
- OpenAI GPT-4 for AI analysis

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL 8.0
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both `frontend` and `backend` directories
   - Configure database, Redis, and API keys

4. Run database migrations:
   ```bash
   npm run migrate --workspace=backend
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

## Project Structure

```
riseroutes-ai-ads-platform/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API client services
│   │   ├── hooks/      # Custom React hooks
│   │   ├── types/      # TypeScript type definitions
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── backend/            # Node.js backend application
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Business logic services
│   │   ├── models/     # Database models
│   │   ├── middleware/ # Express middleware
│   │   ├── utils/      # Utility functions
│   │   └── types/      # TypeScript type definitions
│   └── migrations/     # Database migrations
└── package.json        # Root package configuration
```

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

## License

Proprietary - All rights reserved
