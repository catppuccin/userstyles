import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import catppuccin from "@catppuccin/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightImageZoom from "starlight-image-zoom";
import starlightGitHubAlerts from "starlight-github-alerts";
import { remarkHeadingId } from "remark-custom-heading-id";

export default defineConfig({
  site: "https://userstyles.catppuccin.com",
  markdown: {
    remarkPlugins: [remarkHeadingId],
  },
  integrations: [
    starlight({
      title: "Catppuccin Userstyles",
      logo: {
        src: "./public/favicon.png",
      },
      favicon: "/favicon.png",
      social: [
        {
          icon: "blueSky",
          label: "BlueSky",
          href: "https://bsky.app/profile/catppuccin.com",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/catppuccin/userstyles",
        },
      ],
      sidebar: [
        {
          label: "Start here",
          autogenerate: { directory: "start-here" },
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "Userstyle Creation",
          collapsed: true,
          items: [
            "userstyle-creation",
            {
              label: "How can I theme ...?",
              autogenerate: { directory: "userstyle-creation/guides" },
            },
            {
              label: "Tutorials",
              autogenerate: { directory: "userstyle-creation/tutorials" },
            },
            {
              label: "Tips and Tricks",
              autogenerate: { directory: "userstyle-creation/tips-and-tricks" },
            },
          ],
        },
      ],
      customCss: ["./src/styles/landing.css", "./src/styles/custom.css"],
      plugins: [
        catppuccin(),
        starlightLinksValidator({
          errorOnRelativeLinks: false,
        }),
        starlightGitHubAlerts(),
        starlightImageZoom(),
      ],
      routeMiddleware: "./src/routeData.ts",
    }),
  ],
});
