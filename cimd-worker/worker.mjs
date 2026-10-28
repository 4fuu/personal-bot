/*
 * cimd-worker/worker.mjs - the MCP Client ID Metadata Document, one per console
 * origin, out of one Cloudflare Worker.
 *
 * A CIMD's client_id has to be the exact URL the document is fetched from, so a
 * static file can only ever describe one console address. The console's
 * callback path is fixed (/mcp/oauth/callback) and only its origin varies, so
 * the origin rides in the path instead:
 *
 *   https://<worker>/<id>/<scheme>/<host[:port]>/mcp-client.json
 *
 * answers with that origin's document, its client_id set to the URL just asked
 * for. <id> is a name the caller chooses (see idProblem), which is what keeps
 * two users with a console at the same origin - both on http://localhost:8080,
 * say - from registering the same client_id on one MCP server. Any host is
 * served: the worker is a public service, and a document only ever names the
 * origin the caller put in the path, which an authorization server already
 * refuses unless it matches the address the browser used. Only malformed input
 * is refused - a bad scheme, a segment that is not a host, the wrong path - with
 * a 400, and so is an id that breaks its rules.
 *
 * Deployed with wrangler (wrangler.toml sits beside this file); there is no
 * build step and no dependency beyond wrangler itself.
 */

/** The fields every document carries, exactly as the static mcp-client.json does. */
const DOCUMENT = {
  client_name: 'personal-bot',
  client_uri: 'https://github.com/4fuu/personal-bot',
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
};

/** The one console route an authorization server sends the browser back to. */
const CALLBACK_PATH = '/mcp/oauth/callback';

const DOCUMENT_NAME = 'mcp-client.json';

/** The caller-chosen id's shape: 16 to 64 characters of A-Z a-z 0-9 _ -. */
const ID_MIN = 16;
const ID_MAX = 64;
const ID_CHARS = /^[A-Za-z0-9_-]+$/;

const SCHEMES = new Set(['http', 'https']);
const DEFAULT_PORTS = { http: '80', https: '443' };

/** A host segment carries a name, a port or a bracketed IPv6 literal, nothing else. */
const HOST_SEGMENT = /^[A-Za-z0-9.:[\]-]+$/;
const HOSTNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*$/;

export default {
  fetch(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter((part) => part.length > 0);
    if (parts.length === 3 && parts[2] === DOCUMENT_NAME) {
      // The form this worker had before it carried an id: no id, no document.
      return refuse(400, 'add an id: /<id>/<scheme>/<host[:port]>/mcp-client.json');
    }
    if (parts.length !== 4 || parts[3] !== DOCUMENT_NAME) {
      return refuse(404, 'no such document');
    }
    const id = parts[0];
    const idProblemText = idProblem(id);
    if (idProblemText !== null) {
      return refuse(400, idProblemText);
    }
    const scheme = parts[1].toLowerCase();
    if (!SCHEMES.has(scheme)) {
      return refuse(400, `unknown scheme: ${scheme}`);
    }
    const host = parseHost(parts[2], scheme);
    if (host === null) {
      return refuse(400, 'malformed host');
    }
    const origin = originOf(scheme, host);
    const document = {
      client_id: request.url,
      redirect_uris: [`${origin}${CALLBACK_PATH}`],
      ...DOCUMENT,
    };
    return new Response(JSON.stringify(document), {
      headers: { 'content-type': 'application/json' },
    });
  },
};

/** A plain-text refusal, so a caller never mistakes one for a document. */
function refuse(status, message) {
  return new Response(`${message}\n`, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

/**
 * The rule an id breaks, as text that names it, or null when it keeps them all:
 * 16 to 64 characters, only A-Z a-z 0-9 _ -, at least one letter and at least
 * one digit. The id is part of the client_id the MCP server registered, so a
 * console keeps using the one it first picked - a new id is a new client there.
 */
function idProblem(id) {
  if (!ID_CHARS.test(id)) return 'an id may hold only A-Z a-z 0-9 _ -';
  if (id.length < ID_MIN || id.length > ID_MAX) {
    return `an id is ${ID_MIN} to ${ID_MAX} characters, this one is ${id.length}`;
  }
  if (!/[A-Za-z]/.test(id) || !/[0-9]/.test(id)) {
    return 'an id needs at least one letter and at least one digit';
  }
  return null;
}

/**
 * host[:port] as one path segment -> {hostname, port}, or null when it is not a
 * host. The URL parser does the work: it refuses a port out of range and an
 * unterminated IPv6 literal, lower-cases the name and compresses the address
 * the way a browser compresses it. It is lenient where a host is not -
 * `example..com` parses, and so does `example.com.` - so the shape is checked
 * here as well.
 */
function parseHost(value, scheme) {
  if (!HOST_SEGMENT.test(value)) return null;
  let parsed;
  try {
    parsed = new URL(`${scheme}://${value}`);
  } catch {
    return null;
  }
  if (!parsed.hostname.startsWith('[') && !HOSTNAME.test(parsed.hostname)) return null;
  return { hostname: parsed.hostname, port: parsed.port };
}

/** The origin a browser on that host would report, without the scheme's default port. */
function originOf(scheme, host) {
  const port = host.port === '' || host.port === DEFAULT_PORTS[scheme] ? '' : `:${host.port}`;
  return `${scheme}://${host.hostname}${port}`;
}
