FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm ci --only=production
RUN npm run build

FROM node:lts-alpine
COPY --from=build /app/dist /app
COPY --from=build /app/node_modules /app/node_modules
