# 🎯 BullMQ (Background Job)

## 📌 Overview
A modular, production-ready setup for managing background tasks using BullMQ and Redis. Built for reliability, observability, and scalability — perfect for queues like welcome emails, payment retries, or cleanup jobs.
This repository demonstrates a practical implementation of background processing using BullMQ — a powerful Redis-based job/task queue for Node.js. 
It covers:
- Modular queue configuration
- Worker setup with fault tolerance
- Retry & backoff strategies
- Logging & production-grade enhancements

## ❗ Problem
In real-world applications, executing time-consuming or failure-prone tasks (like sending emails, resizing images, etc.) synchronously in the request-response cycle leads to:

- Latency and blocked threads 🕒
- Poor fault isolation and resilience ❌
- Tight coupling between the API and execution logic 🔗

## ✅ Benefits
By offloading work to background jobs:

- ⏱️ Improved performance — fast responses to the client
- 🔄 Automatic retries — built-in resiliency with exponential backoff
- 🪵 Better observability — centralized logging of worker activity
- 🧩 Scalable design — add more workers as workload grows
- 🧪 Testability — isolate side effects for easier debugging
- 🔧 Production-ready — with job deduplication, structured configs, and safe enqueuing.

## 🚀 Installation

### 🐳 Install Docker Desktop
- Download and install Docker: [Docker Desktop](https://www.docker.com/products/docker-desktop/)


### 💾 Setup Redis Using Docker

```bash
docker pull redis
docker run --name my-redis -d -p 6379:6379 redis
```

#### 📦 Project Setup
- Clone the Repository
```bash
git clone <your-repo-url>
cd <your-project-directory>
``` 
- 🧰 Setup `util` Service
    - Move into the util solution and create an .env file:
    ```bash
    NODE_ENV=development

    # Redis
    REDIS_HOST = 127.0.0.1
    #Local Docker
    #DB_HOST=host.docker.internal
    #REDIS_USERNAME = username
    #REDIS_PASSWORD = password
    REDIS_DB = 0
    REDIS_PORT = 6379

    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Build the utility package:
    ```bash
    npm run build
    ```
    - Link the package:
    ```bash
    npm link
    ```
- 🌐 Setup `api` Service
    - Move into the api solution and create an .env file:
    ```bash
    NODE_ENV=development
    PORT=3000

    # Logging
    LOG_FORMAT=dev
    LOG_DIR=logs

    # CORS Config
    ORIGIN=*
    CREDENTIALS=true

    # Redis
    REDIS_HOST = 127.0.0.1
    #Local Docker
    #DB_HOST=host.docker.internal
    #REDIS_USERNAME = username
    #REDIS_PASSWORD = password
    REDIS_DB = 0
    REDIS_PORT = 6379

    # Rate Limiter
    RATE_LIMITER=1000
    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Link the `util` package:
    ```bash
    npm link <utilurl>
    ```
    - Build the Api service:
    ```bash
    npm run build
    ```
    - Run the API in development mode:
    ```bash
    npm run dev
    ```
📌 Note: 

- This demo uses [Pipeline Workflow](https://github.com/KishorNaik/Sol_pipeline_workflow_expressJs) provides a structured approach to executing sequential operations, ensuring safe execution flow, error resilience, and efficient logging.


## Source Code
- Helper
  https://github.com/KishorNaik/Sol_BullMq_Background_Job_ExpressJs_Typescript/tree/main/utils/src/core/shared/utils/helpers/bullMq/jobs
- Trigger Job
  https://github.com/KishorNaik/Sol_BullMq_Background_Job_ExpressJs_Typescript/blob/main/api/src/modules/demo/apps/features/v1/triggerJob/endpoint/services/triggerJob/index.ts
- Job Process
  https://github.com/KishorNaik/Sol_BullMq_Background_Job_ExpressJs_Typescript/blob/main/api/src/modules/job/apps/features/v1/processJob/job/index.ts