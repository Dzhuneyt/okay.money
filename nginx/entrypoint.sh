#!/usr/bin/env sh

# Create the conf file based on where this container is running (local or AWS ECS cluster)
envsubst < /tmp/nginx/nginx.conf > /etc/nginx/nginx.conf

echo Backend host is ${BACKEND_HOST}
echo Frontend host is ${FRONTEND_HOST}

if [[ "$IS_AWS" -eq "1" ]]; then
    echo "NGINX running in AWS cluster";

    dockerize -wait tcp://${BACKEND_HOST}:80 -wait tcp://${FRONTEND_HOST}:80 -timeout 30s -- echo Connected to upstreams && nginx -g 'daemon off;'
else
    echo Not in AWS
    nginx -g 'daemon off;'
fi
