{
  lib,
  denoPlatform,
}:
denoPlatform.mkDenoDerivation {
  name = "userstyles";
  version = "unstable";

  src = ../.;

  buildPhase = ''
    mkdir -p $out
    deno task ci:generate-import
  '';

  installPhase = ''
    cp -r dist/* $out
  '';

  meta = {
    description = "A collection of userstyles for various websites.";
    homepage = "https://github.com/catppuccin/userstyles";
    license = lib.licenses.mit;
    maintainers = with lib.maintainers; [isabelroses];
  };
}
