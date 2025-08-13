FROM golang:latest AS build
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN go build -o hello

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/hello .
CMD ["./hello"]