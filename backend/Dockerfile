# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 755 uploads

# Expose port (Render will set PORT environment variable)
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
