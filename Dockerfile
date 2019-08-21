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

ENTRYPOINT ["/bin/sh", "-c", "sleep 5 && npm run ${0:-test}"]
CMD ["test"]
