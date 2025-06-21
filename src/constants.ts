import os from 'os';
import path from 'path';

export const UI_BASE = 'http://localhost:3000'; // Next.js UI
export const API_BASE = 'http://localhost:3001'; // NestJS backend
export const TOKEN_PATH = path.join(os.homedir(), '.flagsync-auth');
export const JWT = '_hst';
