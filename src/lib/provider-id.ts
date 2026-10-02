/**
 * Provider IDs: the identity Executor gives one kind of credential at one
 * vendor, e.g. `vercel.com/api`, `linear.app/mcp`, `google.com/gmail/api`.
 *
 * Convention: `<registrable vendor domain>[/<product>]/<surface>`. Two catalog
 * entries share an ID only when one connection would serve both. An MCP server
 * shares `<domain>/api` only if every credential it accepts also works on the
 * vendor's API; an MCP server with its own OAuth is `<domain>/mcp`. Authless
 * servers and unclear cases carry no ID.
 *
 * Format (enforced): lowercase `[a-z0-9.-]` segments joined by single `/`,
 * at most 255 characters.
 */
export const PROVIDER_ID_PATTERN = /^[a-z0-9.-]+(\/[a-z0-9.-]+)*$/;
export const PROVIDER_ID_MAX_LENGTH = 255;

export function isProviderId(value: unknown): value is string {
  return typeof value === "string" && value.length <= PROVIDER_ID_MAX_LENGTH && PROVIDER_ID_PATTERN.test(value);
}

/**
 * Parse `provider-ids.json`: `{ entries: { "<catalog entry id>": "<provider id>" } }`.
 * Throws on any malformed ID so a bad edit fails the build instead of shipping.
 */
export function parseProviderIds(json: unknown): Map<string, string> {
  const entries = (json as { entries?: unknown } | null)?.entries;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    throw new Error('provider-ids.json: expected { "entries": { "<entry id>": "<provider id>" } }');
  }
  const out = new Map<string, string>();
  const bad: string[] = [];
  for (const [id, providerId] of Object.entries(entries)) {
    if (!isProviderId(providerId)) bad.push(`${id}: ${JSON.stringify(providerId)}`);
    else out.set(id, providerId);
  }
  if (bad.length > 0) throw new Error(`provider-ids.json: invalid provider IDs\n  ${bad.join("\n  ")}`);
  return out;
}
