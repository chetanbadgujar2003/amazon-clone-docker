# Build static assets and serve with nginx (production-ready)
FROM node:21-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]