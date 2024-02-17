FROM node:20 as Builder
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:20-alpine as Production
WORKDIR /app
COPY --from=Builder /app/dist .
COPY package.json ./
RUN yarn install --production
RUN ls -alr
EXPOSE 4000

CMD ["node", "dist/index.js"]