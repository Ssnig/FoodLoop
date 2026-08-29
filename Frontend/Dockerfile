# Build from the repository root — the Vite app imports Backend via @backend:
#   docker build -f Frontend/Dockerfile .

FROM node:20-alpine AS build
WORKDIR /app

COPY Frontend/package.json Frontend/package-lock.json ./Frontend/
RUN npm ci --prefix Frontend

COPY Backend ./Backend
COPY Frontend ./Frontend

ARG VITE_N8N_RESCUE_WEBHOOK_URL=/api/n8n/webhook/foodloop-rescue-created
ENV VITE_N8N_RESCUE_WEBHOOK_URL=$VITE_N8N_RESCUE_WEBHOOK_URL

WORKDIR /app/Frontend
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/Frontend/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
