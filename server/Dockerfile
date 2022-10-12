FROM ubuntu:20.04

RUN apt update \
    && apt install -y curl \
    && apt install -y build-essential \
    && apt install -y python3-pip
    
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt install -y nodejs

RUN npm i -g yarn

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

COPY . .

CMD yarn && yarn dev