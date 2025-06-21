import { Command } from 'commander';

import { generateAction, loginAction, logoutAction } from './actions';

const program = new Command();

program.name('flagsync').description('Flagsync CLI').version('0.1.0');

program
  .command('login')
  .description('Authorize the CLI with your FlagSync account')
  .action(loginAction);

program
  .command('logout')
  .description('Logout and remove session')
  .action(logoutAction);

program
  .command('generate')
  .description('Generate feature flag types')
  .action(generateAction);

program.parseAsync(process.argv);
