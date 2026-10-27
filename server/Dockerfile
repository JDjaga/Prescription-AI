# Backend Dockerfile for MedaskAI (Node.js/Express)
# Use a lightweight alpine image for a smaller footprint
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies securely and efficiently
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Explicitly copy the Vision API key. This is crucial because .gitignore
# might exclude it from the default 'COPY . .' command.
COPY vision-key.json ./

# The port is specified by the PORT environment variable in Cloud Run.
# EXPOSE is for documentation and not strictly needed here.

# Start the application
CMD ["node", "index.js"]
