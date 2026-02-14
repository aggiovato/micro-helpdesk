FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY apps/api/package.json apps/api/package-lock.json* ./

RUN npm install

COPY apps/api/ ./

EXPOSE 4000
CMD ["npm", "run", "dev"]
