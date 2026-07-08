#!/bin/bash
# MEKONG SMART LAND SYSTEM — Deployment Helper

set -e

echo "🚀 MEKONG SMART LAND — Deployment Script"

# Build
echo "📦 Building production bundle..."
npm run build

# Docker build & run (local test)
if command -v docker &> /dev/null; then
  echo "🐳 Building Docker image..."
  docker build -t mekong-smart-land:v1.0 .
  echo "✅ Docker image ready. Run with:"
  echo "   docker run -p 8080:80 mekong-smart-land:v1.0"
else
  echo "⚠️  Docker not found — skipping container build"
fi

echo ""
echo "✅ Build complete. dist/ is ready for Vercel / Netlify / any static host."
echo "📍 Recommended: Deploy dist/ folder directly."