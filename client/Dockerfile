FROM node:16-alpine

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

COPY . .

ENV HOST=0.0.0.0

CMD yarn && yarn dev