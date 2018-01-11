FROM alpine:3.6

LABEL maintainer="Darryl Murray <darrylmurray@me.com>"

ENV KUBE_LATEST_VERSION="v1.9.0"

RUN apk add --update ca-certificates \
 && apk add --update -t deps curl openssl \
 && apk add --update gettext \
 && apk add --update mysql-client \
 && curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl \
 && chmod +x /usr/local/bin/kubectl \
 && curl https://raw.githubusercontent.com/kubernetes/helm/master/scripts/get | sh \
 && apk del --purge deps \
 && rm /var/cache/apk/*
