import YAML from "yaml";

export type Category = {
  key: string;
  name: string;
  description?: string;
  emoji?: string;
};

// Remote file location (specific commit hash)
const CATEGORIES_URL =
  "https://raw.githubusercontent.com/catppuccin/catppuccin/d4f82739e687cfd19d168be355367fdbbcc8e029/resources/categories.yml";

/**
 * Loads the categories.yml from the Catppuccin repo.
 * Runs at build time (Astro will await this).
 */
export async function getCategories(): Promise<Record<string, Category>> {
  const content = await fetch(
    CATEGORIES_URL
  ).then((res) => res.text());

  const parsed = YAML.parse(content) as Category[];

  // Turn into a lookup table by key
  return Object.fromEntries(parsed.map((c) => [c.key, c]));
}
