#FROM node:10 AS builder
#
#WORKDIR /app
#
#COPY . .
#
#RUN npm ci --no-audit && \
#    npm run build

FROM nginx:alpine

EXPOSE 80
#RUN rm -rf /usr/share/nginx/html/ && ln -s /app/dist /usr/share/nginx/html
#COPY --from=builder /app/dist/* /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf
