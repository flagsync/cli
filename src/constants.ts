import os from 'os';
import path from 'path';

import { FlagSyncSdk } from './types';

export const UI_BASE = 'https://www.flagsync.com';
export const API_BASE = 'https://api.flagsync.com';

export const TOKEN_PATH = path.join(os.homedir(), '.flagsync-auth');
export const CookieMap = {
  JWT: 'flagsync',
  CSRF: 'flagsync_csrf',
};

export const SDKs: FlagSyncSdk[] = [
  {
    name: 'React',
    library: '@flagsync/react-sdk',
    type: 'client',
  },
  {
    name: 'JavaScript',
    library: '@flagsync/js-sdk',
    type: 'client',
  },
  {
    name: 'Node',
    library: '@flagsync/node-sdk',
    type: 'server',
  },
  {
    name: 'Next.js',
    library: '@flagsync/nextjs-sdk',
    type: 'server',
  },
  {
    name: 'Nest.js',
    library: '@flagsync/nestjs-sdk',
    type: 'server',
  },
];
