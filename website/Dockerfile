FROM nginx:alpine

# ставим заменятор
RUN apk add --no-cache gettext

COPY . /usr/share/nginx/html

# подставляем env-переменные в config.js
ENV USER_SERVICE_URL=http://user-service:8080 \
    SESSION_SERVICE_URL=http://session-service:8083 \
    SESSION_SERVICE_WS_URL=ws://session-service:8083/ws \
    MATCHMAKER_SERVICE_URL=http://matchmaker:8084 \
    GAME_DEV_URL=http://game-dev:8079

RUN envsubst < /usr/share/nginx/html/config.js > /tmp/config.js && \
    mv /tmp/config.js /usr/share/nginx/html/config.js

# дефолтный конфиг nginx (убери свой lua-nginx.conf)
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80