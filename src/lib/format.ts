/** `2021-11-05`, used for `datetime` attributes and index rows. */
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** `November 5, 2021` (UTC, so build machines agree). */
export const longDate = (d: Date) =>
  d.toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

/** `Nov 5` for index rows (the year is the group heading). */
export const shortDate = (d: Date) => d.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });

/** View-transition name shared by an index row and its detail page. */
export const vtName = (kind: "title" | "date", id: string) => `${kind}-${id.replace(/[^A-Za-z0-9_-]/g, "-")}`;

/** `Nov 5, 2021` for the metadata row. */
export const mediumDate = (d: Date) =>
  d.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
