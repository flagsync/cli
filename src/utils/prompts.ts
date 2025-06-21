import { select } from '@inquirer/prompts';

import { User } from '../types';

export async function promptForWorkspace(user: User): Promise<{
  workspaceId: number;
  environmentId: number;
  organizationId: number;
}> {
  if (!user.organizations.length) {
    throw new Error('No organizations available for this user.');
  }

  const orgChoices = user.organizations.map((org) => ({
    name: org.organizationName,
    value: org.organizationId,
  }));

  const selectedOrgId = await select({
    message: 'Select an organization:',
    choices: orgChoices,
  });

  const selectedOrg = user.organizations.find(
    (org) => org.organizationId === selectedOrgId,
  );

  if (!selectedOrg || !selectedOrg.workspaces.length) {
    throw new Error('No workspaces available for the selected organization.');
  }

  const workspaceChoices = selectedOrg.workspaces.map((ws) => ({
    name: ws.workspaceName,
    value: ws.workspaceId,
  }));

  const selectedWorkspaceId = await select({
    message: 'Select a workspace:',
    choices: workspaceChoices,
  });

  const selectedWorkspace = selectedOrg.workspaces.find(
    (ws: any) => ws.workspaceId === selectedWorkspaceId,
  );
  if (!selectedWorkspace) throw new Error('Selected workspace not found');

  /**
   * All environments in a workspace share the same flags, so grab the first one
   * we find.
   */
  const environmentId = selectedWorkspace.environments[0]?.environmentId;
  if (!environmentId)
    throw new Error('No environments available in selected workspace');

  return {
    environmentId,
    workspaceId: selectedWorkspaceId,
    organizationId: selectedOrg.organizationId,
  };
}

export async function promptSdkChoice() {
  return select({
    message: 'Select your SDK:',
    choices: [
      { name: 'React', value: '@flagsync/react-sdk' },
      { name: 'JavaScript', value: '@flagsync/js-sdk' },
      { name: 'Node', value: '@flagsync/node-sdk' },
      { name: 'Next.js', value: '@flagsync/nextjs-sdk' },
      { name: 'Nest.js', value: '@flagsync/nestjs-sdk' },
    ],
  });
}
