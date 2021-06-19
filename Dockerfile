FROM node:14 AS dev
WORKDIR /usr/src/app
ENV NODE_ENV=development

CMD npx nodemon src/server/konshuu-server.ts

FROM dev AS prod
COPY package*.json ./
RUN npm install
ENV NODE_ENV=production
COPY . .
RUN npx prisma generate

CMD npm run build:prod && npx prisma migrate deploy && node src/server/konshuu-server.ts
