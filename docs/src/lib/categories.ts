import YAML from "yaml";
import { type PortEntry, ports } from "./ports.ts";

export type Category = {
  key: string;
  name: string;
  description: string;
  emoji: string;
};

const CATEGORIES_URL =
  "https://raw.githubusercontent.com/catppuccin/catppuccin/d4f82739e687cfd19d168be355367fdbbcc8e029/resources/categories.yml";

const content = await fetch(
  CATEGORIES_URL,
).then((res) => res.text());
const parsed = YAML.parse(content) as Category[];

// Turn into a lookup table by key
export const categories = Object.fromEntries(parsed.map((c) => [c.key, c]));

// Group ports by category
export const categoryMap: Record<string, typeof ports> = ports.reduce(
  (acc, port) => {
    for (const cat of port.categories) {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(port);
    }
    return acc;
  },
  {} as Record<string, PortEntry[]>,
);

// Sort categories by name
export const sortedCategories = Object.keys(categoryMap).sort((a, b) => {
  const aName = categories[a]?.name ?? a;
  const bName = categories[b]?.name ?? b;
  return aName.localeCompare(bName);
});
