(function() {
  const colors = {
    latte: {
      base: "#eff1f5",
      blue: "#1e66f5",
      lavender: "#7287fd",
      mantle: "#e6e9ef",
      rosewater: "#dc8a78",
      text: "#4c4f69",
    },
    frappe: {
      base: "#303446",
      blue: "#8caaee",
      lavender: "#babbf1",
      mantle: "#292c3c",
      rosewater: "#f2d5cf",
      text: "#c6d0f5",
    },
    macchiato: {
      base: "#24273a",
      blue: "#8aadf4",
      lavender: "#b7bdf8",
      mantle: "#1e2030",
      rosewater: "#f4dbd6",
      text: "#cad3f5",
    },
    mocha: {
      base: "#1e1e2e",
      blue: "#89b4fa",
      lavender: "#b4befe",
      mantle: "#181825",
      rosewater: "#f5e0dc",
      text: "#cdd6f4",
    }
  };
  const flavour = window.prompt("Choose a theme:", "mocha");
  const blueLinks = confirm("Use blue links?");

  const ct = colors[flavour];
  const theme = [
    `21=${ct.mantle}`,
    `7=${ct.base}`,
    `8=${ct.text}`,
    `9=${blueLinks ? ct.blue : ct.rosewater}`,
    `aa=${ct.lavender}`,
    `ae=${flavour == "latte" ? -1 : ct.base}`,
    `j=${ct.mantle}`,
    `x=${blueLinks ? ct.blue : ct.rosewater}`,
  ];

  for (const item of theme) {
    document.cookie = `${item}; max-age=126144000; samesite=lax; secure`;
  }
})();
