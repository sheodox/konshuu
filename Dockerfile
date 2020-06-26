FROM node:12 AS dev
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

CMD ["npx", "nodemon", "konshuu-server.js"]

FROM dev AS prod
COPY . .
RUN npm run build
CMD ["node", "konshuu-server.js"]
