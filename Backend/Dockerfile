FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY src ./src
COPY test ./test
COPY scripts ./scripts

RUN addgroup -S foodloop && adduser -S foodloop -G foodloop \
    && chown -R foodloop:foodloop /app
USER foodloop

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "import('./src/services/index.js').then(() => process.exit(0)).catch(() => process.exit(1))"

# In-memory library — no HTTP server. Default: run tests, then stay up for compose/exec.
CMD ["sh", "-c", "node --test test && echo 'FoodLoop backend library is ready.' && exec sleep infinity"]
