# ATELIER 44 — Fashion E-commerce

A responsive full-stack multi-category fashion e-commerce web app.
- **Frontend**: React (CRA + Tailwind + shadcn/ui) with dynamic filtering, search, product detail pages, cart drawer, checkout, account, and admin console.
- **Backend**: FastAPI (Python) with JWT authentication, server-side input validation, and RESTful APIs for auth, products, cart, and orders.
- **Database**: MongoDB with collections for `users`, `products`, `cart`, and `orders`.

Design language: **Editorial Brutalism** — Cabinet Grotesk display + Manrope body, stark black/white with a single accent red (`#D9381E`), sharp-edged (0 radius) components.

## Features

- Landing page with editorial hero, category tiles, featured products, studio manifesto
- Shop page with dynamic filtering (category, price range, size, color), sorting, and search
- Product detail with image gallery, size & color selection, quantity, add-to-cart
- Right-side cart drawer + full cart page (update qty / remove)
- Checkout with shipping form + **mock payment** (no real gateway)
- JWT-based auth (register, login, logout, `/auth/me`)
- Account page with order history
- **Admin console** — Products CRUD (create/update/delete) + Orders list
- 12 sample fashion products seeded on first boot; admin account auto-seeded

## Stack

| Layer     | Tools                                                                 |
|-----------|-----------------------------------------------------------------------|
| Frontend  | React 19, react-router 7, Tailwind, shadcn/ui, sonner, lucide-react, react-fast-marquee, axios |
| Backend   | FastAPI, Motor (async MongoDB), PyJWT, bcrypt, Pydantic v2, python-dotenv |
| Database  | MongoDB                                                               |

## Repository layout

```
/app
├── backend/
│   ├── server.py            # FastAPI app: auth, products, cart, orders, seeding
│   ├── requirements.txt
│   └── .env                 # (see Environment Variables)
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── components/site/ # Header, Footer, CartDrawer, ProductCard, TopMarquee
│   │   ├── components/ui/   # shadcn/ui primitives
│   │   ├── pages/           # Home, Shop, ProductDetail, Cart, Checkout, Login, Register, Account, Admin
│   │   └── lib/api.js
│   ├── package.json
│   └── .env
└── README.md
```

## Environment Variables

### `backend/.env`
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET="<random 64-char hex>"
ADMIN_EMAIL="admin@atelier.com"
ADMIN_PASSWORD="Admin@1234"
FRONTEND_URL="http://localhost:3000"
```

### `frontend/.env`
```
REACT_APP_BACKEND_URL="http://localhost:8001"   # or your deployed API base URL
WDS_SOCKET_PORT=443
```

> The frontend always calls `${REACT_APP_BACKEND_URL}/api/*`. All backend routes are prefixed with `/api`.

## Local setup

### Prerequisites
- Node 18+ and Yarn
- Python 3.11+
- MongoDB running locally (or a MongoDB Atlas URL)

### Backend
```bash
cd backend
pip install -r requirements.txt
# ensure backend/.env has MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
On first boot the app seeds:
- One admin account (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- 12 sample fashion products (only if the `products` collection is empty)

### Frontend
```bash
cd frontend
yarn install
yarn start        # runs on http://localhost:3000
```

## Default credentials

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | `admin@atelier.com`  | `Admin@1234`|
| Customer | Register a new one via `/register` |             |

## REST API

Base URL: `${REACT_APP_BACKEND_URL}/api`

### Auth
| Method | Path                | Auth  | Body / Query                                   |
|--------|---------------------|-------|------------------------------------------------|
| POST   | `/auth/register`    | –     | `{ email, password (≥6), name }`               |
| POST   | `/auth/login`       | –     | `{ email, password }`                          |
| POST   | `/auth/logout`      | user  | –                                              |
| GET    | `/auth/me`          | user  | –                                              |

Auth uses httpOnly `access_token` cookies **and** returns the token in the JSON body for `Authorization: Bearer <token>` clients.

### Products
| Method | Path                                | Auth  |
|--------|-------------------------------------|-------|
| GET    | `/products` (filters: category, search, min_price, max_price, size, color, sort, featured, limit) | – |
| GET    | `/products/categories`              | –     |
| GET    | `/products/{id}`                    | –     |
| POST   | `/products`                         | admin |
| PUT    | `/products/{id}`                    | admin |
| DELETE | `/products/{id}`                    | admin |

### Cart (per user)
| Method | Path                        | Auth |
|--------|-----------------------------|------|
| GET    | `/cart`                     | user |
| POST   | `/cart` `{product_id,size,color,quantity}` | user |
| PUT    | `/cart/{item_id}` `{quantity}` | user |
| DELETE | `/cart/{item_id}`           | user |
| DELETE | `/cart`                     | user |

### Orders
| Method | Path              | Auth  |
|--------|-------------------|-------|
| POST   | `/orders`         | user  | Body: `{ shipping_address: { full_name, line1, ..., country, phone } }` — creates order from current cart, clears cart, marks as `confirmed` (mock payment). |
| GET    | `/orders`         | user  | Current user's orders |
| GET    | `/orders/all`     | admin | All orders |

## Data model

- **users** — `{ id, email (unique), password_hash (bcrypt), name, role: 'admin'|'customer', created_at }`
- **products** — `{ id, name, description, price, compare_at_price?, category, subcategory?, sizes[], colors[], images[], stock, featured, created_at }`
- **cart** — one document per cart line: `{ id, user_id, product_id, size?, color?, quantity, created_at }`
- **orders** — `{ id, user_id, user_email, items[], subtotal, shipping, total, shipping_address, status, payment_method: 'mock', created_at }`

## Pushing to GitHub

From this workspace, use Emergent's **"Save to GitHub"** feature (top-right on the Emergent app) — it will create a repo, push your codebase, and add a `.gitignore`. The commit history from your session is preserved.

If pushing manually:
```bash
git init
git add .
git commit -m "Initial commit: ATELIER 44 fashion e-commerce"
git branch -M main
git remote add origin git@github.com:<your-user>/<your-repo-name>.git
git push -u origin main
```

## License
MIT.
