export * as UserStylesSchema from "./userstyles.d.ts";
export * as PortsSchema from "catppuccin-repo/resources/generate/types.d.ts";

import { Entries } from "https://esm.sh/type-fest@4.8.1";
declare global {
  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>;
  }
}
