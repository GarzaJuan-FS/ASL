FROM node:18

WORKDIR /app

# Only copy manifest first for layer caching
COPY package*.json ./

# Install deps (ci if lockfile exists, otherwise install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Now copy the rest of your app
COPY . .

# Expose the port your app uses
EXPOSE 8080

CMD ["npm", "start"]