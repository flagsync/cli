import fs from 'fs';
import path from 'path';

import { TOKEN_PATH } from '../constants';
import { OrgContext, StoreToken } from '../types';

export function hasStoredToken(): boolean {
  return fs.existsSync(TOKEN_PATH);
}

export function getStoredToken(): StoreToken | null {
  try {
    const data = fs.readFileSync(TOKEN_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed ?? null;
  } catch {
    return null;
  }
}

export async function storeToken(token: string, context: OrgContext) {
  const dir = path.dirname(TOKEN_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify({ token, context }, null, 2));
}

export async function removeToken() {
  if (hasStoredToken()) {
    fs.rmSync(TOKEN_PATH);
    return true;
  }
  return false;
}
