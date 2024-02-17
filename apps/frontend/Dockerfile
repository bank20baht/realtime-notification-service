
# stage 1 install and build

FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_APP_API_SSE_HOST=http://localhost:3000
ENV VITE_APP_API_SSE_HOST=$VITE_APP_API_SSE_HOST

ARG VITE_APP_API_REST_HOST=http://localhost:4000
ENV VITE_APP_API_REST_HOST=$VITE_APP_API_REST_HOST

RUN npm run build

# stage 2 serve build files by nginx

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .