# Multi-stage build for React + Vite frontend
# Stage 1: Build stage
FROM node:22-alpine as builder

WORKDIR /build

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies with optimized caching
RUN npm ci --only=production && \
    npm ci --only=development

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime stage with Nginx
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -S www-data -g 101 && \
    adduser -S www-data -G www-data -u 101 && \
    chown -R www-data:www-data /usr/share/nginx/html && \
    chown -R www-data:www-data /var/cache/nginx && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /etc/nginx/conf.d

# Switch to non-root user
USER www-data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
