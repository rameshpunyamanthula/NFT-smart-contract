FROM node:18-bullseye

WORKDIR /app

# Install build tools for native addons if needed
RUN apt-get update && apt-get install -y python3 make build-essential && rm -rf /var/lib/apt/lists/*

# Copy dependency descriptors and install (cacheable layer)
COPY package.json package-lock.json* ./

# Install dependencies (allow legacy peer deps to avoid dependency resolution errors)
RUN npm install --legacy-peer-deps

# Copy rest of files
COPY . .

# Compile to verify before tests
RUN npx hardhat compile

# Default: run tests
CMD ["npx", "hardhat", "test", "--network", "hardhat"]
