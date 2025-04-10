{
  nodejs-slim_23,
  pnpm,
  mkShellNoCC,
  ...
}:
mkShellNoCC {
  packages = [
    nodejs-slim_23
    (pnpm.override { nodejs = nodejs-slim_23; })
  ];
}
