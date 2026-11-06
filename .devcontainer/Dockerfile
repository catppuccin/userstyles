FROM denoland/deno:bin-2.9.3 AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:24
COPY --from=deno /deno /usr/local/bin/deno
