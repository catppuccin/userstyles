/**
 * Utility function that formats a list of items into the "x, y, ..., and z" format.
 * @example
 * formatListOfItems(['x']); // 'x'
 * @example
 * formatListOfItems(['x', 'y']); // 'x and y'
 * @example
 * formatListOfItems(['x', 'y', 'z']); // 'x, y, and z'
 */
export function formatListOfItems(items: unknown[]): string {
  // If there are no items, return an empty string.
  if (items.length === 0) return "";
  // If there are two items, connect them with an "and".
  if (items.length === 2) return items.join(" and ");
  // Otherwise, there is either just one item or more than two items.
  return items.reduce((prev, curr, idx, arr) => {
    // If this is the first item of the items we are looping through, set our initial string to it.
    if (idx === 0) return curr;
    // If this is the last one, add a comma (Oxford commas are amazing) followed by "and" and the item to the string.
    if (curr === arr.at(-1)) return prev + `, and ${curr}`;
    // Otherwise, it is some item in the middle of the list and we can just add it as a comma followed by the item to the string.
    return prev + `, ${curr}`;
  }) as string;
}

/**
 * Utility function that pluralizes a word based on a count or the length of an array.
 * @example
 * pluralize(1, 'maintainer'); // 'maintainer'
 * @example
 * pluralize(['x', 'y'], 'maintainer'); // 'maintainers'
 */
export function pluralize(c: number | unknown[], str: string): string {
  if (typeof c === "undefined") return str;
  const num = Array.isArray(c) ? c.length : c;
  return num === 1 ? str : `${str}s`;
}
