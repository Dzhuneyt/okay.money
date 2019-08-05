timestamp=$(date +%s)

docker system prune -f
TAG=$timestamp docker-compose up --build
