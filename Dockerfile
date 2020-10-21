FROM ubuntu:20.04
FROM node:12

WORKDIR /usr/src/app

COPY ./src/ ./src/
COPY ./.babelrc ./
COPY ./hugo ./
COPY ./install.sh ./
COPY ./package.json ./
COPY ./yarn.lock ./

ENV SECRET=secret

RUN ./install.sh

CMD [ "yarn", "start" ]
