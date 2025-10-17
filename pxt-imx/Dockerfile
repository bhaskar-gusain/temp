# Dockerfile - i.MX8ULP Build Environment for MakeCode PXT
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install build tools, make, and dependencies
RUN apt-get update && apt-get install -y \
	    build-essential \
	    cmake \
	    ninja-build \
	    git \
	    make \
	    python3 \
	    python3-pip \
	    wget \
	    unzip \
	    curl \
	    xz-utils \
	    libnewlib-arm-none-eabi \
	    libstdc++-arm-none-eabi-newlib \
	    && apt-get clean \
	    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
&& apt-get install -y nodejs

# Install ARM GCC toolchain
ENV GCC_VERSION=12.3.rel1
RUN wget -q https://developer.arm.com/-/media/Files/downloads/gnu/${GCC_VERSION}/binrel/gcc-arm-${GCC_VERSION}-x86_64-arm-none-eabi.tar.xz \
&& tar -xf gcc-arm-${GCC_VERSION}-x86_64-arm-none-eabi.tar.xz -C /opt \
&& rm gcc-arm-${GCC_VERSION}-x86_64-arm-none-eabi.tar.xz

ENV PATH="/opt/gcc-arm-${GCC_VERSION}-x86_64-arm-none-eabi/bin:${PATH}"

# Install pxt globally
RUN npm install -g pxt

WORKDIR /src

# Default entrypoint
ENTRYPOINT ["/bin/bash", "-c"]

