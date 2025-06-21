import ora from 'ora';

import { removeToken } from '../utils/token';

export async function runLogoutFlow() {
  const spinner = ora().start();
  spinner.text = 'Logging out...';

  const removed = await removeToken();
  spinner.succeed(removed ? 'Logged out successfully.' : 'Already logged out.');
}
