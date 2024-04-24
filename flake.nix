{
  description = "Catppuccin userstyles";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";

    # broken until https://github.com/nekowinston/nix-deno/issues/11
    nix-deno.url = "github:nekowinston/nix-deno/fix/npm-semver-dash";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  } @ inputs:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [inputs.nix-deno.overlays.default];
      };
    in {
      packages.default = pkgs.callPackage ./nix/default.nix {};

      devShells.default = pkgs.callPackage ./nix/shell.nix {};
    });
}
