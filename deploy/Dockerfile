FROM alpine:3.6

MAINTAINER Darryl Murray <darrylmurray@me.com>

ENV KUBE_LATEST_VERSION="v1.7.6"

RUN apk add --update ca-certificates \
 && apk add --update -t deps curl \
 && apk add --update gettext \
 && curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl \
 && curl https://raw.githubusercontent.com/kubernetes/helm/master/scripts/get | bash \
 && chmod +x /usr/local/bin/kubectl \
 && apk del --purge deps \
 && rm /var/cache/apk/*