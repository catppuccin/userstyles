{
  deno,
  typos,
  mkShellNoCC,
  nodePackages,
  ...
}:
mkShellNoCC {
  packages = [
    deno
    typos
    nodePackages.prettier
  ];
}
