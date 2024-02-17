
# stage 1 install and build

FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# stage 2 serve build files by nginx

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .