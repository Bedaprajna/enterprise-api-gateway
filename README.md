<img width="1354" height="592" alt="Screenshot (121)" src="https://github.com/user-attachments/assets/a1765ecc-8df4-4a89-9f70-8f5cceed08f7" />
<img width="1350" height="601" alt="Screenshot (120)" src="https://github.com/user-attachments/assets/00f23b6a-041a-447a-b469-c65bafccc199" />
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
