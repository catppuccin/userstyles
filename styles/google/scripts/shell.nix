{
  deno,
  mkShellNoCC,
  playwright-driver,
}:
mkShellNoCC {
  packages = [
    deno
  ];
  nativeBuildInputs = [
    playwright-driver.browsers
  ];

  shellHook = ''
    export PLAYWRIGHT_BROWSERS_PATH=${playwright-driver.browsers}
    export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
    export PLAYWRIGHT_HOST_PLATFORM_OVERRIDE="ubuntu-24.04"
  '';
}
