FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . /app

RUN npm run build

FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
