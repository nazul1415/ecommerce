# E-Commerce Distributed Platform

A production-ready e-commerce platform built with a micro-frontend & microservices mindset. The ecosystem includes a high-performance REST API in Go, a public store built with Next.js (SSR), an administrative dashboard in React, and a PostgreSQL database initialized with full-text search capability.

---

## 🛠️ Tech Stack & Architecture

| Service | Technology | Role / Responsibility | Port |
| :--- | :--- | :--- | :--- |
| **Backend API** | Go 1.25 / Gin | RESTful API managing product catalog, stock validation, and checkout transactions. Excelent preformance. | `8080` |
| **Public Store** | Next.js 15 / React 19 / Tailwind | Customer-facing storefront with Server-Side Rendering (SSR) for optimal SEO and performance. | `3000` |
| **Admin Panel** | React (Vite) / Nginx | Single Page Application (SPA) for inventory management, CSV batch imports, and CRUD operations. | `3001` |
| **Database** | PostgreSQL 18 | Relational storage with `pg_trgm` GIN indexes for fast product search. | `5432` |

---

## 🏗️ Architectural & Technical Decisions

### 1. Zero-Manual-Setup Database Initialization (`init.sql`)
* **Decision:** Rather than relying on manual migrations or external tools on the host machine, database schema definition (tables, constraints, and GIN full-text indexes) is executed automatically via PostgreSQL's entrypoint script (`/docker-entrypoint-initdb.d/init.sql`).
* **Benefit:** Ensures a clean, predictable database schema from second zero upon running the project for the first time.

### 2. Dual Network Context for Next.js SSR vs. Browser
* **Decision:** Configured separate API URLs for Next.js:
  * `API_URL_SERVER` (`http://backend:8080/api/v1`) for internal Server-Side Rendering (SSR) queries within the Docker bridge network.
  * `NEXT_PUBLIC_API_URL` (`http://localhost:8080/api/v1`) for client-side fetches directly from the user's browser.
* **Benefit:** Prevents `localhost` resolution errors during SSR while keeping client-side interactivity fast and seamless.

### 3. Container-Native Isolation & Health Checks
* **Decision:** Leveraged Docker Compose service orchestration with dependency constraints (`depends_on` with `service_healthy`).
* **Benefit:** Guarantees that backend and frontend services only attempt to start once PostgreSQL is fully ready to accept connections.

### 4. Bussiness rules
* **Decisions:** For the CSV file reading process, validations were added for currency and price (free) formats, as well as checks for duplicate SKUs and notifications. Add dummy image for the products and validate stock on purchase flow.

---

## 🚀 Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* [Git](https://git-scm.com/) installed.

### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nazul1415/ecommerce
   cd ecommerce
   ```

2. **Launch the ecosystem with Docker Compose:**
   ```bash
   docker compose up --build
   ```

   *Docker will build images, apply database scripts, and spin up all 4 containers automatically.*

3. **Access the Applications:**
   * **Public Store:** [http://localhost:3000](http://localhost:3000)
   * **Admin Panel:** [http://localhost:3001](http://localhost:3001)
   * **user**      admin@ecommerce.com
   * **password**  Admin123!
   * **Go Backend API:** [http://localhost:8080/api/v1/products](http://localhost:8080/api/v1/products)
   * **PostgreSQL Database:** `localhost:5432`

---

## 🧹 Stopping the Application

To shut down the services and clean up network resources:

```bash
docker compose down
```

To perform a complete fresh restart (resetting database volumes):

```bash
docker compose down -v
docker compose up --build
```

## Downloaded date of csv file
August 11 2026