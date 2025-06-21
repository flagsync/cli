import ora from 'ora';

import { runGenerateFlow } from './commands/generate';
import { runLoginFlow } from './commands/login';
import { runLogoutFlow } from './commands/logout';

export async function loginAction() {
  try {
    await runLoginFlow();
  } catch (err) {
    ora().fail(`Login failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

export async function logoutAction() {
  try {
    await runLogoutFlow();
  } catch (err) {
    ora().fail(`Logout failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

export async function generateAction() {
  try {
    await runGenerateFlow();
  } catch (err) {
    ora().fail(
      `Type generation failed: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }
}
