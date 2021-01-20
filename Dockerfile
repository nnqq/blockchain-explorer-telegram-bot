FROM node:12-alpine as build
WORKDIR /app
COPY / /app/
RUN npm i
RUN npm run build
RUN npm prune --production

FROM node:12-alpine
COPY --from=build /app/dist /app
COPY --from=build /app/node_modules /app/node_modules
