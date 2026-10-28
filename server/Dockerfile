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

# Google Vision credentials: the client uses Application Default Credentials (ADC).
# On Cloud Run/App Engine, ADC uses the built-in service account automatically.
# On a VPS, mount the key file and set GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/vision-key.json
# in docker-compose.yml or via -e (never bake the key into the image).

# Start the application
CMD ["node", "index.js"]
