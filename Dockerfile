FROM node:20-alpine3.19

# Create app directory and set permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

RUN apk update && apk add bash
# Using `--no-cache` to avoid caching the index locally
RUN apk add --no-cache ffmpeg
RUN apk add python3
RUN npm install -g pm2

# Copy package files
COPY package*.json .

# Set permissions for package files to avoid root access
RUN chown node:node package*.json

# Switch to non-root user
USER node

# Install dependencies
RUN npm install

# Copy application files with correct ownership and permissions
COPY --chown=node:node . .

# Generate prisma client and build the application
RUN npx prisma generate && npm run build

EXPOSE 8000

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]