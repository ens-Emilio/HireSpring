#!/bin/bash

set -e

echo "🚀 Starting Job Portal..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "📦 Building and starting containers..."
docker compose up -d --build

echo "⏳ Waiting for backend to be healthy..."
ATTEMPTS=0
MAX_ATTEMPTS=30
until curl -s -f http://localhost:8080/actuator/health > /dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
        echo "⚠️  Backend health check timed out. Check logs with: docker compose logs backend"
        break
    fi
    echo "   Waiting for backend... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 3
done

if [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; then
    echo ""
    echo "✅ Job Portal is running!"
    echo ""
    echo "🌐 Frontend: http://localhost:5173"
    echo "🔧 Backend API: http://localhost:8080"
    echo "📚 Swagger UI: http://localhost:8080/swagger-ui.html"
    echo "💚 Health: http://localhost:8080/actuator/health"
    echo ""
    echo "🛑 To stop: docker compose down"
    echo "📋 To view logs: docker compose logs -f"
else
    echo ""
    echo "⚠️  Services may still be starting. Try: docker compose logs -f"
fi
