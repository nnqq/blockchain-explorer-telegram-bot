FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY ./lib ./

CMD [ "node", "/usr/src/app/bot.js" ]
