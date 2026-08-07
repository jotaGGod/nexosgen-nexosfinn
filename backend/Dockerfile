# --- Build ---
FROM golang:1.26-alpine AS builder

WORKDIR /src

# As dependencias sao baixadas antes do codigo para que a camada fique em
# cache enquanto go.mod/go.sum nao mudarem.
COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/seed ./cmd/seed

# --- Runtime ---
FROM alpine:3.20

RUN apk add --no-cache ca-certificates wget && \
    adduser -D -u 10001 nexosgen-nexosfinn

WORKDIR /app

COPY --from=builder /out/api /app/api
COPY --from=builder /out/seed /app/seed
COPY --from=builder /src/docs /app/docs

USER nexosgen-nexosfinn

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
    CMD wget -qO- http://localhost:8080/health/ready || exit 1

CMD ["/app/api"]
