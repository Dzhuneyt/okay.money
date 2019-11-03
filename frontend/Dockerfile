#FROM node:10 AS builder
#
#WORKDIR /app
#
#COPY . .
#
#RUN npm ci --no-audit && \
#    npm run build:prod

# App needs to be built and mounted as /app beforehand
FROM nginx:1.17.2-alpine

WORKDIR /app
#COPY --from=builder /app/dist/* /app/dist/frontend/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

