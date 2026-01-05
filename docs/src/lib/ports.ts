// deno-lint-ignore-file no-explicit-any

import fs from "fs";
import path from "path";
import YAML from "yaml";

export type Collaborator = string;

export type PortEntry = {
  slug: string;
  name: string;
  link: string;
  categories: string[];
  icon?: string;
  color: string;
  note?: string;
  currentMaintainers?: Collaborator[];
  pastMaintainers?: Collaborator[];
  supports?: Record<string, { name: string; link: string }>;
};

const file = fs.readFileSync(
  path.resolve("../scripts/userstyles.yml"),
  "utf-8",
);
const parsed = YAML.parse(file) as {
  collaborators: Collaborator[];
  userstyles: Record<string, any>;
};

// TODO: Use proper types from scripts lib once possible.

// Normalize keys (camelCase)
function normalizePort(slug: string, data: any): PortEntry {
  return {
    slug,
    name: data.name,
    link: data.link,
    categories: data.categories ?? [],
    icon: data.icon,
    color: data.color,
    note: data.note,
    currentMaintainers: data["current-maintainers"] ?? [],
    pastMaintainers: data["past-maintainers"] ?? [],
    supports: data.supports,
  };
}

export const ports: PortEntry[] = Object.entries(parsed.userstyles).map(
  ([slug, data]) => normalizePort(slug, data),
);
