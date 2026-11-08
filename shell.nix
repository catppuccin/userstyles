{
  nodejs-slim,
  pnpm,
  mkShellNoCC,
}:
mkShellNoCC {
  packages = [
    nodejs-slim
    pnpm
  ];
}
