FROM node:10 AS builder

WORKDIR /app

COPY . .

RUN npm ci --no-audit && \
    npm run build

FROM nginx:alpine

EXPOSE 80
COPY --from=builder /app/dist/* /usr/share/nginx/html/
