FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm i
RUN npm run build
RUN npm prune --production

FROM node:lts-alpine
COPY --from=build /app/dist /app
COPY --from=build /app/node_modules /app/node_modules
