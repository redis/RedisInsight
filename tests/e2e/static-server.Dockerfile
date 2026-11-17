FROM node:24.22.2-alpine

WORKDIR /app

RUN npm install express

COPY static.ts .

CMD ["node", "static.ts"]
