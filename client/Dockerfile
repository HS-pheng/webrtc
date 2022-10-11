FROM node:16-alpine

WORKDIR /app/client

COPY ["package.json", "yarn.lock", "./"]

RUN yarn

COPY . .

ENV HOST=0.0.0.0

CMD ["yarn", "dev"]