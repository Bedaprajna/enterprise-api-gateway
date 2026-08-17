# Enterprise API Gateway & Telemetry Dashboard

An enterprise-grade API Gateway microservice architecture built with Node.js, Express, and React. Features dynamic reverse proxying, security middleware (rate-limiting & API keys), and a real-time observability dashboard backed by SQLite.

## Key Features
* **Dynamic Reverse Proxy:** Proxies incoming requests on port `8000` to isolated downstream microservices (`Users` service on `:5001` and `Orders` service on `:5002`).
* **Security & Traffic Control:** Custom middleware enforcing API Key header validation (`x-api-key`) and IP rate-limiting (10 req/min).
* **Automated Telemetry:** Database middleware saving request latencies, HTTP status codes, and payload headers into an SQLite database (`telemetry.db`).
* **Observability Dashboard:** React (Vite) dashboard displaying real-time system metrics, latency graphs, and searchable audit logs.

## Architecture Overview
```text
enterprise-api-gateway/
├── gateway/           # Express API Gateway (Port 8000)
├── mock-services/     # Microservices (Users: 5001, Orders: 5002)
├── dashboard/         # React / Vite Telemetry UI
└── package.json       # Monorepo dependencies & orchestration
