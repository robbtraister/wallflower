FROM alpine

RUN \
    apk update && \
    apk upgrade && \
    apk add --no-cache \
            nodejs-npm \
            && \
    npm i -g npm && \
    rm -rf /var/cache/apk/* && \
    node -v && \
    npm -v

WORKDIR /opt/project

COPY ./package*.json ./
RUN npm ci

ENTRYPOINT ["/bin/sh", "-c", "npm run ${COMMAND:-${0:-test}}"]
CMD ["test"]
