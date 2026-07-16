FROM node:22.22.0-alpine

WORKDIR /app

RUN npm install express

COPY static.ts .

CMD ["node", "static.ts"]
