# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

# Copy remaining files
COPY . .

# Expose the port your app uses
EXPOSE 3000

# Run the app
CMD ["node", "index.js"]
