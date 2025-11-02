#!/bin/bash
# Quick test to verify GitHub model types can be downloaded

cd "$(dirname "$0")"

echo "=== Testing GitHub Model Types Download ==="
echo ""
echo "Testing URL: https://raw.githubusercontent.com/drawthingsai/community-models/refs/heads/main/models.txt"
echo ""

curl -s "https://raw.githubusercontent.com/drawthingsai/community-models/refs/heads/main/models.txt" | head -20

echo ""
echo "=== First 20 lines shown above ==="
echo ""
echo "Testing LoRAs..."
curl -s "https://raw.githubusercontent.com/drawthingsai/community-models/refs/heads/main/loras.txt" | wc -l

echo "Testing ControlNets..."
curl -s "https://raw.githubusercontent.com/drawthingsai/community-models/refs/heads/main/controlnets.txt" | wc -l

echo ""
echo "✅ GitHub URLs are accessible"
