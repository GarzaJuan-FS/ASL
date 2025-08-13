FROM alpine:3.19
RUN apk add --no-cache lua
WORKDIR /app
COPY app.lua .
CMD ["lua5.4","app.lua"]