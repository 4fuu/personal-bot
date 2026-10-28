/*
 * cimd-worker/worker.mjs - the MCP Client ID Metadata Document, one per console
 * origin, out of one Cloudflare Worker.
 *
 * A CIMD's client_id has to be the exact URL the document is fetched from, so a
 * static file can only ever describe one console address. The console's
 * callback path is fixed (/mcp/oauth/callback) and only its origin varies, so
 * the origin rides in the path instead:
 *
 *   https://<worker>/<scheme>/<host[:port]>/mcp-client.json
 *
 * answers with that origin's document, its client_id set to the URL just asked
 * for. Which origins may be described is limited to loopback plus the host
 * names listed in the CIMD_EXTRA_HOSTS variable, so a stranger cannot use this
 * worker to hand an authorization server a document that redirects somewhere
 * of their choosing. Everything else is refused: 404 for a host that is not
 * allowed, 400 for an address that is not a host at all.
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

/**
 * Loopback needs no configuration: it is a console on the machine the browser
 * is on, so nothing outside that machine can be redirected there.
 */
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

const SCHEMES = new Set(['http', 'https']);
const DEFAULT_PORTS = { http: '80', https: '443' };

/** A host segment carries a name, a port or a bracketed IPv6 literal, nothing else. */
const HOST_SEGMENT = /^[A-Za-z0-9.:[\]-]+$/;
const HOSTNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*$/;

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter((part) => part.length > 0);
    if (parts.length !== 3 || parts[2] !== DOCUMENT_NAME) {
      return refuse(404, 'no such document');
    }
    const scheme = parts[0].toLowerCase();
    if (!SCHEMES.has(scheme)) {
      return refuse(400, `unknown scheme: ${scheme}`);
    }
    const host = parseHost(parts[1], scheme);
    if (host === null) {
      return refuse(400, 'malformed host');
    }
    if (!isAllowed(host, env.CIMD_EXTRA_HOSTS ?? '')) {
      // 404 rather than 403: the worker does not confirm which hosts it knows.
      return refuse(404, 'host not allowed');
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

/**
 * Whether this host may be described. Loopback always may be, over either
 * scheme; every other host has to be named in CIMD_EXTRA_HOSTS, which is what
 * keeps the worker from pointing an authorization server at somebody else's
 * callback. Only the host name is checked, never the port: the port is part of
 * the redirect URI the document hands out, and an authorization server already
 * refuses a callback that does not match the address the browser used.
 */
function isAllowed(host, extra) {
  if (LOOPBACK_HOSTNAMES.has(host.hostname)) return true;
  return extraHosts(extra).has(host.hostname);
}

/**
 * The variable's comma-separated host names as a set. An entry that is not a
 * host is dropped rather than failing the whole list, so one typo does not
 * lock out the hosts that are spelled right.
 */
function extraHosts(value) {
  const hosts = new Set();
  for (const entry of value.split(',')) {
    const host = parseHost(entry.trim(), 'https');
    if (host !== null) hosts.add(host.hostname);
  }
  return hosts;
}

/** The origin a browser on that host would report, without the scheme's default port. */
function originOf(scheme, host) {
  const port = host.port === '' || host.port === DEFAULT_PORTS[scheme] ? '' : `:${host.port}`;
  return `${scheme}://${host.hostname}${port}`;
}
