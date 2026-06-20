# Inventory & Order Management System

A production-ready full-stack Inventory & Order Management System built with **React**, **FastAPI**, **PostgreSQL**, and **Docker**.

## Features

- **Product Management** — Create, read, update, and delete products with unique SKU validation
- **Customer Management** — Manage customers with unique email enforcement
- **Order Management** — Create orders with automatic stock deduction and total calculation
- **Dashboard** — Overview of totals and low-stock alerts
- **Transaction Safety** — Order processing uses database transactions with rollback on failure
- **Stock Restoration** — Cancelling an order restores inventory

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Router, Lucide Icons |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL 16 |
| Infrastructure | Docker, Docker Compose, Nginx |

## Quick Start with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Run the full stack

```bash
# Clone the repository
git clone <your-repo-url>
cd Inventory

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Ensure PostgreSQL is running (via Docker or locally)
cp ../.env.example .env

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend dev server: http://localhost:5173

## API Endpoints

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Dashboard statistics and low-stock products |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | List products (paginated) |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers` | List customers (paginated) |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders` | List orders (paginated) |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

## Business Rules

- SKU must be unique across products
- Customer email must be unique
- Stock quantity cannot go negative
- Orders cannot exceed available inventory
- Order total is calculated server-side from product prices at order time
- Deleting an order restores stock quantities

## Project Structure

```
Inventory/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── db/           # Database config
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API client
│   │   └── styles/       # Design tokens & global CSS
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Deployment

### Backend (Render / Railway / Fly.io)

1. Build and push the Docker image to Docker Hub
2. Set environment variables: `DATABASE_URL`, `CORS_ORIGINS`
3. Deploy the container

### Frontend (Vercel / Netlify)

1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Set environment variable: `VITE_API_BASE_URL=<your-backend-url>`

### Database

Use a managed PostgreSQL instance or the Docker-hosted PostgreSQL with a named volume (`postgres_data`).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `inventory` |
| `POSTGRES_PASSWORD` | Database password | `inventory` |
| `POSTGRES_DB` | Database name | `inventory` |
| `DATABASE_URL` | Full connection string | — |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `LOW_STOCK_THRESHOLD` | Low stock alert threshold | `10` |
| `VITE_API_BASE_URL` | Backend URL for frontend | `http://localhost:8000` |

## License

MIT
