#!/bin/bash

# Blockchain Auto-Start Script for Rwanda Quantum Agriculture Platform
# This script starts a local Hardhat blockchain node and deploys the payment contract

echo "🚀 Starting Blockchain Payment System..."

# Navigate to contracts directory
cd "$(dirname "$0")/contracts" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing contract dependencies..."
    npm install
fi

# Kill any existing Hardhat nodes
echo "🧹 Cleaning up existing Hardhat processes..."
pkill -f "hardhat node" 2>/dev/null || true

# Start Hardhat node in background
echo "🔗 Starting Hardhat local blockchain node..."
npx hardhat node > hardhat-node.log 2>&1 &
HARDHAT_PID=$!

# Wait for node to be ready
echo "⏳ Waiting for blockchain node to initialize..."
sleep 5

# Deploy contract
echo "📜 Deploying smart contract..."
npx hardhat run scripts/deploy-and-save.ts --network localhost

if [ $? -eq 0 ]; then
    echo "✅ Blockchain payment system started successfully!"
    echo "📝 Hardhat node PID: $HARDHAT_PID"
    echo "📊 Node logs: contracts/hardhat-node.log"
    echo ""
    echo "🎯 Contract deployed and ready for frontend integration"
    echo "💡 Frontend can now connect to: http://127.0.0.1:8545"
    echo ""
    echo "To stop the blockchain node, run: kill $HARDHAT_PID"
else
    echo "❌ Contract deployment failed. Check hardhat-node.log for details."
    kill $HARDHAT_PID
    exit 1
fi
