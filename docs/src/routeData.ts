import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  context.locals.starlightRoute.siteTitle = "Userstyles";
});