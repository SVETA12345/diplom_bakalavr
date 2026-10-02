FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY . .

EXPOSE 3005

CMD ["npm", "start"]