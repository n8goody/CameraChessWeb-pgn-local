FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy your code
COPY . .

# Build the optimized frontend
RUN npm run build

EXPOSE 8080

# Boot up the middleman server
CMD ["node", "server.js"]