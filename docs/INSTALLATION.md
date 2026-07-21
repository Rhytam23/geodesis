# 📦 Installation & Setup Guide

This guide provides comprehensive instructions for installing, configuring, and running **Geodesis** locally or in production.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: `v20.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v10.0.0` or higher (included with Node.js)
- **Git**: `v2.30.0` or higher ([Download Git](https://git-scm.com/))

---

## 🚀 Step-by-Step Installation

### 1. Clone the Repository
Clone the project from GitHub and navigate into the workspace directory:

```bash
git clone https://github.com/Rhytam23/geodesis.git
cd geodesis
```

### 2. Install Dependencies
Install all required project dependencies using `npm`:

```bash
npm install
```

### 3. Environment Configuration (Optional)
Copy `.env.example` to create your local environment file:

```bash
cp .env.example .env.local
```

> 💡 **Note**: Geodesis runs out-of-the-box without any API keys. Public services (Open-Meteo, ISRIC SoilGrids, OSM Nominatim) are free and fall back to deterministic regional demonstration data if unreachable.

---

## 💻 Local Development

Start the Vite local development server:

```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000/workspace](http://localhost:3000/workspace)**.

---

## 🧪 Verification & Quality Checks

Run the automated CI gate commands to verify project health:

```bash
npm run typecheck    # Verify TypeScript compilation (0 errors)
npm run lint         # Run ESLint code quality checks
npm test             # Run Vitest unit tests
npm run build        # Build production Vite bundle
npm run ci           # Run all checks sequentially
```

---

## 🚢 Production Build

To build the application for production deployment:

```bash
npm run build
```

The optimized static build output will be generated in the `dist/` directory, ready to deploy to Vercel, Netlify, Docker, or any static web host.
