FROM node:current-alpine

WORKDIR /app

RUN apk add python make gcc g++

COPY package.json package-lock.json binding.gyp nest-cli.json ./
COPY tsconfig.build.json tsconfig.json ./

COPY libs libs
COPY src src
COPY scripts scripts

RUN ls
RUN npm i

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

CMD ["npm","run","start:prod"]