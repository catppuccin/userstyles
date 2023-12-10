export * as UserStylesSchema from "@/types/userstyles.d.ts";
export * as PortsSchema from "catppuccin-repo/resources/types/ports.d.ts";

import { Entries } from "https://esm.sh/type-fest@4.8.1";
declare global {
  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>;
  }
}
