FROM node:current-alpine

WORKDIR /app

RUN apk add python make gcc g++

COPY package.json package-lock.json binding.gyp nest-cli.json ./
COPY tsconfig.build.json tsconfig.json ./

COPY libs libs
COPY src src

RUN npm i

RUN ls

RUN make

ENV NODE_ENV=production
ENV PORT=8080

CMD make start