FROM gcc:13-bookworm
WORKDIR /app
COPY main.c .
RUN gcc -O2 -o hello main.c
CMD ["./hello"]