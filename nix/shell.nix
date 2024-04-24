{
  deno,
  callPackage,
  nodePackages,
  ...
}: let
  mainPkg = callPackage ./default.nix {};
in
  mainPkg.overrideAttrs (oa: {
    buildInputs =
      [
        deno
        nodePackages.prettier
      ]
      ++ (oa.nativeBuildInputs or []);
  })
