{
  deno,
  mkShellNoCC,
  nodePackages,
  ...
}:
mkShellNoCC {
  packages = [
    deno
    nodePackages.prettier
  ];
}
