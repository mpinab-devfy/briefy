# Multi-stage Docker build for React application
# Compatible with environment variables from deployment platforms

# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies - use npm install instead of npm ci for better compatibility
RUN npm install --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_GEMINI_API_KEY
ARG REACT_APP_BASE_URL

# Set environment variables during build
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_GEMINI_API_KEY=$REACT_APP_GEMINI_API_KEY
ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL

# Build the application
# Environment variables will be automatically injected by the build platform
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
