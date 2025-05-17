ARG BASE_BUILD_TAG
FROM $BASE_BUILD_TAG

WORKDIR /opt/backend

ARG ENV
RUN echo "$ENV" > .env

CMD ["sh", "entrypoint.sh"]

