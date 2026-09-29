/**
 * format.ts — helpers the templates use to display data.
 *
 * registerRoutes (routes.ts) makes these available in every template, e.g.
 * `<%= courseTitle(course) %>`.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * A course's title, ready to put in a web page: characters that mean
 * something in HTML (like & and <) are replaced with HTML entities.
 */
export function courseTitle(course: { name: string }): string {
  return course.name.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch]);
}
