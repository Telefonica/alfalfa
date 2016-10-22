FROM node:slim

WORKDIR /opt/alfalfa

ADD . .

RUN npm install && \
    npm prune --production && \
    npm cache clean

EXPOSE 3000

ENTRYPOINT ["./bin/server"]
