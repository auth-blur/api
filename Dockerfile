FROM node:lts-alpine

WORKDIR /app

RUN apk add python make gcc g++

COPY package.json binding.gyp nest-cli.json ./
COPY tsconfig.build.json tsconfig.json ./

COPY libs libs
COPY src src
COPY scripts scripts

RUN npm i

RUN npm run lib:build

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

CMD ["npm","run","start:prod"]
