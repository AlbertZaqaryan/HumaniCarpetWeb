# HumaniCarpet — Handmade Rugs Online Store

A full-stack e-commerce web application for a handmade rugs business. Customers can browse products, filter by category and price, add items to cart, place orders, and design custom rugs using an interactive canvas editor. Admins manage everything through an extended Django admin panel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Django 5 · Django REST Framework · SimpleJWT |
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript |
| **Styling** | Tailwind CSS v4 · Framer Motion |
| **State** | Zustand (cart, auth, theme) |
| **Design Tool** | Fabric.js v7 (interactive canvas editor) |
| **Database** | SQLite (dev) · PostgreSQL (prod) |
| **Auth** | JWT access/refresh tokens |
| **Email** | SMTP (Gmail-compatible) |

---

## Features

### Storefront
- **Home** — Hero section with editable background, featured rugs slider, brand intro
- **Shop** — Browse all rugs with category filters, price range, search, sorting, pagination
- **Product Details** — Large image, description, pricing, related products
- **Cart** — Add/remove items, update quantities, persistent via localStorage
- **Checkout** — Order form (no payment gateway), email notification to admin + confirmation to customer

### Custom Design Studio
- **Drawing tools** — Brush, spray paint, eraser with adjustable size
- **Shapes** — Rectangle, circle, triangle, line, star, heart, diamond, hexagon, pentagon, octagon
- **Text** — Editable text with custom fonts and colors
- **Image upload** — Place and resize images on the canvas
- **Colors** — 36-color palette + custom picker, separate fill/stroke for shapes, 8 canvas backgrounds
- **Layers** — Visibility, lock/unlock, reorder
- **Actions** — Undo/redo (50-step), zoom (25–200%), duplicate, download PNG
- **Submit** — Send design as PNG + JSON to admin for review

### User Accounts
- Register, login, logout (JWT)
- Profile page, order history

### Admin Panel (Django)
- Manage rugs (CRUD), categories, featured products
- View and process orders, custom design submissions, contact messages
- Edit homepage hero image, text, and site settings
- Inline order items, image thumbnails, status management

### Other
- Dark / light mode toggle
- Fully responsive (mobile-first)
- Smooth page transitions and animations
- Toast notifications
- Keyboard shortcuts in design studio

---

## Project Structure

```
HumaniCarpetWeb/
├── backend/                    # Django API
│   ├── backend/                # Project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── store/                  # Main app (products, orders, designs)
│   │   ├── models.py           # Category, Rug, Order, CustomDesign, etc.
│   │   ├── views.py            # API views (DRF generics + FBVs)
│   │   ├── serializers.py
│   │   ├── filters.py          # django-filter for rug filtering
│   │   ├── admin.py            # Extended admin with inlines & thumbnails
│   │   ├── emails.py           # SMTP email helpers
│   │   └── urls.py
│   ├── accounts/               # Auth app (register, profile)
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── templates/emails/       # HTML email templates
│   ├── media/                  # Uploaded images (gitignored)
│   ├── seed_data.py            # Database seeder script
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   │   ├── page.tsx        # Home
│   │   │   ├── shop/           # Shop + [slug] detail
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── custom-design/  # Fabric.js design studio
│   │   │   ├── auth/           # Login, register
│   │   │   ├── profile/
│   │   │   ├── orders/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── home/           # Hero, FeaturedSlider, BrandIntro
│   │   │   ├── layout/         # Navbar, Footer, ClientShell
│   │   │   └── ui/             # Button, ProductCard, Skeleton
│   │   ├── stores/             # Zustand stores (auth, cart, theme)
│   │   └── lib/                # API client, TypeScript types
│   ├── public/                 # Static assets
│   ├── next.config.ts
│   ├── tailwind / postcss configs
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 20+
- **npm** 10+

### 1. Clone the repository

```bash
git clone <repository-url>
cd HumaniCarpetWeb
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env   # or create manually (see Environment Variables below)

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# (Optional) Seed sample data
python manage.py shell < seed_data.py

# Start the server
python manage.py runserver
```

The API will be available at **http://127.0.0.1:8000/api/**

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local   # or create manually

# Start dev server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=sqlite:///db.sqlite3

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
ADMIN_EMAIL=admin@example.com

FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_MEDIA_URL=http://127.0.0.1:8000
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings/` | Site settings (hero, about) |
| `GET` | `/api/categories/` | All categories |
| `GET` | `/api/rugs/` | Paginated rugs (filterable, searchable, sortable) |
| `GET` | `/api/rugs/featured/` | Featured rugs |
| `GET` | `/api/rugs/<slug>/` | Single rug detail |
| `GET` | `/api/rugs/<slug>/related/` | Related rugs |
| `POST` | `/api/orders/` | Create order |
| `GET` | `/api/orders/mine/` | User's orders (auth required) |
| `POST` | `/api/custom-designs/` | Submit custom design |
| `POST` | `/api/contact/` | Send contact message |
| `POST` | `/api/auth/register/` | Register |
| `POST` | `/api/auth/login/` | Get JWT tokens |
| `POST` | `/api/auth/refresh/` | Refresh JWT token |
| `GET` | `/api/auth/profile/` | Get profile (auth required) |
| `PATCH` | `/api/auth/profile/update/` | Update profile (auth required) |

---

## Admin Panel

Access the Django admin at **http://127.0.0.1:8000/admin/**

Manage:
- **Rugs** — Add/edit products with image thumbnails, categories, pricing, featured flag
- **Categories** — Dynamic categories with slugs and ordering
- **Orders** — View order details with inline items, update status
- **Custom Designs** — Review submitted designs with preview images
- **Contact Messages** — View customer inquiries
- **Site Settings** — Edit hero section, homepage content

---

## Production Deployment

### Backend
```bash
pip install gunicorn psycopg2-binary
python manage.py collectstatic --noinput
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### Frontend
```bash
npm run build
npm start
```

Configure PostgreSQL via `DATABASE_URL`, set `DEBUG=False`, update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` accordingly.

---

## License

This project is proprietary. All rights reserved.
