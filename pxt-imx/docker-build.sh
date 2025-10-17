#!/bin/bash
set -e

echo "Building firmware for i.MX8ULP using Docker..."

# Run docker container that builds firmware.bin
sudo docker run --rm -v "$(pwd)":/workspace -w /workspace akhilalabs/imx8ulp-sdk:latest \
    bash -c "cmake -Bbuild -H. && cmake --build build"

echo "Build finished. Firmware is at build/firmware.bin"

