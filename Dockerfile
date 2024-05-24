# backend/Dockerfile
FROM node:20
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
EXPOSE 9090
CMD ["node", "server.js"]