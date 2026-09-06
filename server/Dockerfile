FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p /app/uploads

EXPOSE 3000
CMD ["node", "src/index.js"]
