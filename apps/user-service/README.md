# User-service

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## 1. Installation

```bash
$ pnpm install
```

# 2. Filling in the parameters .env
```
NODE_ENV=local

DB_HOST=
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
DB_PORT=

RUN_MIGRATIONS='false'

DB_REPLICATION='true'
DB_REPLICATION_COUNT=2

DB_HOST_R_1=
DB_NAME_R_1=
DB_USERNAME_R_1=
DB_PASSWORD_R_1=
DB_PORT_R_1=

DB_HOST_R_2=
DB_NAME_R_2=
DB_USERNAME_R_2=
DB_PASSWORD_R_2=
DB_PORT_R_2=

USER_SERVICE_RMQ_URL=
USER_SERVICE_RMQ_QUEUE=

GAME_SERVICE_RMQ_URL=
GAME_SERVICE_RMQ_QUEUE=

BOT_SERVICE_RMQ_URL=
BOT_SERVICE_RMQ_QUEUE=

BALANCE_SERVICE_RMQ_URL=
BALANCE_SERVICE_RMQ_QUEUE=

TWEET_SCOUT_CLIENT_ID=
TWITTER_CLIENT_ID=
TWITTER_CALLBACK_URI=
TWITTER_ZARGATES_USERNAME=

DISCORD_CLIENT_SECRET_ID=
DISCORD_CLIENT_ID=
DISCORD_CALLBACK_URI=
DISCORD_BOT_TOKEN=
DISCORD_ZARGATES_GUILD_ID=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET_ID=
GOOGLE_CALLBACK_URI=
YOUTUBE_ZARGATES_CHANNEL_ID=

LOG_LEVEL='info'

```

## 3.Running docker (optional)
```bash
$ sudo docker compose up
```

## 3.Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod