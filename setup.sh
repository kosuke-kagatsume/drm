#!/bin/bash

echo "🚀 CRM Monorepo Setup"
echo "===================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be >= 20.0.0 (found $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.15.5
fi
echo "✅ pnpm $(pnpm -v)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop"
    exit 1
fi
echo "✅ Docker $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi
echo "✅ Docker Compose"

# Setup environment
echo ""
echo "🔧 Setting up environment..."

# Copy .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.template .env
    echo "✅ Created .env file from template"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Setup Husky
echo ""
echo "🐶 Setting up Git hooks..."
pnpm prepare

# Start Docker services
echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo ""
echo "🏥 Checking service health..."
docker-compose ps

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run 'pnpm dev' to start development servers"
echo "3. Access pgAdmin at http://localhost:5050 (admin@crm.local / admin)"
echo "4. Access Redis Commander at http://localhost:8081 (run with --profile tools)"
echo ""
echo "Happy coding! 🎉"