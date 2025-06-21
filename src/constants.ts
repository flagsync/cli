import os from 'os';
import path from 'path';

export const UI_BASE = 'https://www.flagsync.com/';
export const API_BASE = 'https://api.flagsync.com/';
export const TOKEN_PATH = path.join(os.homedir(), '.flagsync-auth');
export const JWT = '_hst';
