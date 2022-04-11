FROM node:17.8.0-alpine AS builder

WORKDIR /usr/local/app

COPY ./package.json /usr/local/app
COPY . .

RUN npm install
RUN npm install -g nodemon


CMD ["node", "./dist/apps/api/main.js"]
