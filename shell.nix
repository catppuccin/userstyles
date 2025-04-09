{
  nodejs_23,
  mkShellNoCC,
  ...
}:
mkShellNoCC {
  packages = [
    nodejs_23
  ];
}
