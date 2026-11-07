{
  nodejs,
  pnpm,
  mkShellNoCC,
}:
mkShellNoCC {
  packages = [
    nodejs
    pnpm
  ];
}
