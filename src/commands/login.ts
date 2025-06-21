import chalk from 'chalk';
import crypto from 'crypto';
import http from 'http';
import open from 'open';
import ora from 'ora';

import { API_BASE, JWT, UI_BASE } from '../constants';
import { AccessTokenResponse, CreateSessionResponse, User } from '../types';
import { promptForWorkspace } from '../utils/prompts';
import { storeToken } from '../utils/token';

export async function runLoginFlow() {
  const spinner = ora().start();
  spinner.text = 'Authorizing...';

  const codeVerifier = crypto.randomUUID();
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  let code: string;

  try {
    code = await createLoginSession(codeChallenge);
  } catch (err: unknown) {
    spinner.stop();
    throw err;
  }

  const { server, port } = await createLocalCallbackServer(
    async (receivedCode) => {
      if (!receivedCode) {
        spinner.fail('Missing code in callback');
        return;
      }
      try {
        spinner.text = 'Exchanging token';
        const token = await exchangeCodeForToken(receivedCode, codeVerifier);

        spinner.text = 'Fetching user';
        const user = await fetchUser(token);

        spinner.info(`Logged in as ${chalk.cyan(user.email)}`);

        const context = await promptForWorkspace(user);
        await storeToken(token, context);

        spinner.succeed(
          'Done! Run "npx flagsync generate" to generate flag types.',
        );
      } catch (err: unknown) {
        spinner.stop();
        throw err;
      }
    },
  );

  let loginUrl: string = '';

  try {
    loginUrl = createLoginUrl({ code, port, codeChallenge });
  } catch (err: unknown) {
    spinner.stop();
    throw err;
  }

  spinner.text = 'Opening browser...';
  await open(loginUrl);

  await new Promise<void>((resolve) => server.on('close', resolve));
}

function createLoginUrl({
  code,
  port,
  codeChallenge,
}: {
  code: string;
  port: number;
  codeChallenge: string;
}) {
  if (!code || !port || !codeChallenge)
    throw new Error('Missing required URL parameters');
  if (isNaN(port) || port <= 0 || port > 65535)
    throw new Error('Invalid port number');

  const url = new URL(`${UI_BASE}/cli`);
  url.search = new URLSearchParams({
    code,
    redirectUri: `http://localhost:${port}/cli-login`,
    code_challenge: codeChallenge,
  }).toString();

  return url.toString();
}

async function createLoginSession(codeChallenge: string): Promise<string> {
  const res = await fetch(`${API_BASE}/cli/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code_challenge: codeChallenge }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.status}`);
  }

  const { code } = (await res.json()) as CreateSessionResponse;

  if (!code) {
    throw new Error(`Failed to obtain code from session creation`);
  }

  return code;
}

async function createLocalCallbackServer(
  onAuth: (code: string | null) => Promise<void>,
) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');

    if (url.pathname !== '/cli-login') {
      return;
    }

    const code = url.searchParams.get('code');

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('You can now return to your terminal.');

    try {
      await onAuth(code);
    } finally {
      server.close();
      server.closeAllConnections();
    }
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address !== 'object') {
    throw new Error('Could not start local server');
  }

  return { server, port: address.port };
}

async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}/cli/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, codeVerifier }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get token: ${res.status}`);
  }

  const { accessToken } = (await res.json()) as AccessTokenResponse;
  return accessToken;
}

async function fetchUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/user/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${JWT}=${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get user: ${res.status}`);
  }

  const { user } = (await res.json()) as { user: User };
  return user;
}
