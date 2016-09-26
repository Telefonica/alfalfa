FROM node:slim

WORKDIR /opt/resistart

ADD . .

RUN npm install

EXPOSE $PORT

CMD ["npm", "start", "-s"]
