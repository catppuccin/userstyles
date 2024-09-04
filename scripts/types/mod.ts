export * as UserStylesSchema from "@/types/userstyles.d.ts";
export * as PortsSchema from "@catppuccin/catppuccin/resources/types/ports.d.ts";

import { Entries } from "type-fest";
declare global {
  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>;
  }
}
