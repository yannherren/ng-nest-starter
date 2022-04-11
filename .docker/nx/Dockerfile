FROM node:17.8.0-alpine

WORKDIR /usr/local/app

COPY ./ /usr/local/app/

RUN npm install
RUN npm install -g nx

ENV BUILD_ENV=development

RUN nx run-many --target=build --configuration=$BUILD_ENV --all
