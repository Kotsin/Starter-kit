# ZarGates Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Setups and installation

## Setup environment
- nvm/node js v18.x.x
- TSC v5.2.2
- nx plugin

## 1. Installation

```bash
$ pnpm install
```

# 2. Filling in the parameters .env
```
RABBITMQ_PORT=
RABBITMQ_DEFAULT_USER=
RABBITMQ_DEFAULT_PASS=
```

## 3.Running docker
```bash
$ sudo docker compose up
```

## Running the apps
1. [TG-BOT](apps/tg-bot/README.md)
2. [USER-SERVICE](apps/user-service/README.md)
3. [AUTH-SERVICE](apps/auth-service/README.md)
4. [GAME-SERVICE](apps/game-service/README.md)
5. [API-GATEWAY](apps/api-gateway/README.md)
