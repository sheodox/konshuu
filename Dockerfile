FROM node:18 AS dev
WORKDIR /usr/src/app

ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY prisma prisma
RUN npx prisma generate
CMD npx nodemon --watch dist dist/server/konshuu-server.js


FROM dev AS prod
ENV NODE_ENV=production
COPY . .
RUN npm run build:prod

# before starting, copy all of the newly built frontend assets to the folder nginx serves
CMD cp -R ./public-dist/* ./public && npx prisma migrate deploy && node dist/server/konshuu-server.js
