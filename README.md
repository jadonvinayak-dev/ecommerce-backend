High-Performance Transactional E-Commerce Backend

A production-ready, highly concurrent e-commerce checkout system built with Node.js, Express, PostgreSQL, and Redis. This architecture is explicitly designed to handle extreme traffic spikes safely without crashing database services or degrading user experience.

Key Architectural Features

(i) Concurrency Control & Data Integrity: Uses strict PostgreSQL transaction blocks and Row-Level Locking (`SELECT ... FOR UPDATE`) to eliminate race conditions,   preventing overselling of high-demand stock.
(ii) Traffic Mitigation (Rate Limiter): Features an atomic Redis-backed sliding-window rate limiting middleware that cuts off spam traffic before it hits the service layer.
(iii) Asynchronous Task Offloading: Implements a decoupled job processing architecture using BullMQ and Redis to offload heavy operations (like invoice generation) away from the main thread.


Tech Stack

Runtime: Node.js (Express)
Primary Database: PostgreSQL
Caching & Queue In-Memory Store: Redis
Queue Management: BullMQ
Containerization: Docker & Docker Compose


Local Setup & Installation

1) Clone the repository:
    git clone [https://github.com/jadonvinayak-dev/ecommerce-backend.git](https://github.com/jadonvinayak-dev/ecommerce-backend.git)
    cd ecommerce-backend
2) Configure environment variables: Copy the development environment blueprint to create your active configuration.
    cp .env.example .env
3) Sign up Infrastructure via Docker: Ensure your local system's native PostgreSQL or Redis ports are clear, then boot up the containerized stack in detached mode.
    docker compose up -d
4) Seed the Database Schema: Feed the structural SQL file into your active PostgreSQL container to spin up tables and initialize high-demand seed inventory.
    docker exec -i ecommerce_postgres psql -U user -d ecommerce_db < src/models/schema.sql
5) Start the Application Cluster: Open two separate terminal windows or split panes to run the decoupled layers concurrently.
    Terminal 1 (Main API Core) -
        node server.js
    Terminal 2 (Asynchronous Queue Worker) -
        node src/queues/workers/notification.worker.js

Testing System Behaviors

You can test the core behavioral safeguards of this architecture by firing HTTP payloads using curl from a third terminal window.

1) Simulating an Order & Asynchronous Offloading:

Submit a valid checkout payload -
    
curl -i -X POST http://localhost:3000/api/checkout \
-H "Content-Type: application/json" \
-d '{"userId": 101, "cartItems": [{"productId": 1, "quantity": 1}]}'

API Response (Terminal 3): Instantly returns an HTTP 201 Created header status along with a success confirmation JSON object containing the assigned transactional order ID:
    {"success":true,"message":"Order created successfully and locked down.","data":{"orderId":1,"totalAmount":"1599.99"}}
Background Worker Cluster (Terminal 2): The background process immediately captures the detached task from Redis memory, log-tracking its internal execution steps     without blocking user responses:
    [Worker] Job 1: Processing invoice email for Order #1...
    [Worker] Success: Invoice sent to User #101 for $1599.99

2) Validating Transactional Safety (Stock Depletion):

Your seed file initializes exactly 5 units of inventory for your high-demand items. Continue executing the exact same curl checkout command above.

Upon firing your 6th request, the row-level transaction verification determines that available stock has dropped down to 0. The execution block safely rolls back the database mutations and outputs a clean failure message to safeguard data state integrity:

{
  "success": false,
  "error": "Insufficient stock for RTX 5090 Graphics Card. Available: 0"
}

3) Validating Traffic Mitigation (Redis Rate Limiter):

To test application boundary safety, flood the endpoint with high-frequency traffic (6+ requests within a few seconds).

The custom Redis sliding-window middleware intercepts the high-throughput flood before it ever executes structural routing chains or queries the primary relational database, blocking the source client with an explicit response:

{
  "success": false,
  "error": "Too many requests. Please try again in 58 seconds."
}
