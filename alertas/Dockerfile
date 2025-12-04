
FROM node:22.12.0-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3054

CMD [ "npm", "start" ]