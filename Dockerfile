FROM node:current-alpine

WORKDIR /app

RUN apk add python make gcc g++

COPY package.json package-lock.json binding.gyp ./
COPY libs ./

RUN npm i

RUN ls

COPY build node_modules ./

RUN npm run build

COPY dist .

ENV NODE_ENV=production
ENV PORT=8080

CMD [ "npm", "run", "start:prod" ]