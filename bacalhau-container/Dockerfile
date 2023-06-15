FROM --platform=linux/x86-64 node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN rm -rf
RUN npm run build

CMD [ "node", "./dist/index.js" ]
