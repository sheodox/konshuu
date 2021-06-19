FROM node:12 AS dev
WORKDIR /usr/src/app
ENV NODE_ENV=development

CMD npx nodemon src/server/konshuu-server.ts

FROM dev AS prod
ENV NODE_ENV=production
COPY package*.json ./
RUN npm i
COPY . .
RUN npx prisma generate
RUN npm run build

CMD npm run build:prod && npx prisma migrate deploy && node src/server/konshuu-server.ts
