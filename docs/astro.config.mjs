import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import catppuccin from "@catppuccin/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightImageZoom from "starlight-image-zoom";
import starlightGitHubAlerts from "starlight-github-alerts";
import mermaid from "astro-mermaid";
import { remarkHeadingId } from "remark-custom-heading-id";

export default defineConfig({
  site: "https://userstyles.catppuccin.com",
  markdown: {
    remarkPlugins: [remarkHeadingId],
  },
  integrations: [
    mermaid(),
    starlight({
      title: "Catppuccin Userstyles",
      favicon: "/favicon.png",
      logo: {
        dark: "/public/pepperjack-dark.png",
        light: "/public/pepperjack-light.png",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/catppuccin/userstyles",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/catppuccin/userstyles/edit/main/docs",
      },
      expressiveCode: {
        themes: ["catppuccin-mocha", "catppuccin-latte"],
        styleOverrides: {
          frames: {
            tooltipSuccessBackground: "var(--green)",
            tooltipSuccessForeground: "var(--base)",
          },
          textMarkers: {
            insBackground:
              "color-mix(in oklab, var(--sl-color-green-high) 25%, var(--sl-color-gray-6));",
            insBorderColor: "var(--sl-color-gray-5)",
            delBackground:
              "color-mix(in oklab, var(--sl-color-red-high) 25%, var(--sl-color-gray-6));",
            delBorderColor: "var(--sl-color-gray-5)",
          },
          codeBackground: "var(--sl-color-gray-6)",
        },
      },
      sidebar: [
        {
          label: "Getting started",
          autogenerate: { directory: "getting-started" },
        },
        {
          label: "Contributing",
          collapsed: true,
          items: [
            "contributing",
            "contributing/creating-userstyles",
            "contributing/userstylesyml",
            {
              label: "How can I theme ...?",
              autogenerate: { directory: "contributing/guides" },
            },
            {
              label: "Tutorials",
              autogenerate: { directory: "contributing/tutorials" },
            },
            {
              label: "Tips and Tricks",
              autogenerate: { directory: "contributing/tips-and-tricks" },
            },
            "contributing/standard-library",
            "contributing/library-modules",
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      plugins: [
        catppuccin(),
        starlightLinksValidator(),
        starlightGitHubAlerts(),
        starlightImageZoom(),
      ],
    }),
  ],
});
