import { findUp } from 'find-up';
import fs from 'fs';
import ora from 'ora';
import path from 'path';

import { loginAction } from '../actions';
import { API_BASE, CookieMap } from '../constants';
import {
  Environment,
  EnvironmentGetResponse,
  FeatureFlagVariant,
  FlagMetadata,
  StoreToken,
} from '../types';
import { promptSdkChoice } from '../utils/prompts';
import { getStoredToken, hasStoredToken } from '../utils/token';

export async function runGenerateFlow() {
  if (!hasStoredToken()) {
    await loginAction();
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error(
      'Session not found. Please run `npx flagsync login` first.',
    );
  }

  const sdkChoice = await promptSdkChoice();

  const spinner = ora().start(`Generating flag types for ${sdkChoice}`);

  const environment = await fetchEnvironment(token);
  const metadata = extractFlagKeysAndTypesFromEnvironment(environment);

  spinner.info(`Found ${metadata.length} flags`);

  const types = generateTypes(sdkChoice, metadata);
  const outputPath = await writeFilesToDisk(types);

  spinner.succeed(`Generated flag types, saved to "${outputPath}"`);
}

async function fetchEnvironment(token: StoreToken): Promise<Environment> {
  const res = await fetch(
    `${API_BASE}/environment/${token.context.environmentId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token.csrfToken,
        Cookie: `__Secure-${CookieMap.JWT}=${token.accessToken}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Failed fetch environment flags: ${res.status}`);
  }

  const { environment } = (await res.json()) as EnvironmentGetResponse;
  return environment;
}

function extractFlagKeysAndTypesFromEnvironment(
  environment: Environment,
): FlagMetadata[] {
  return environment.featureFlagStates
    .map((ffes) => ffes.featureFlag)
    .map(({ key, variants }) => {
      const type = getTypeFromVariant(variants);
      if (!type) return null;
      return {
        key,
        type,
      };
    })
    .filter(Boolean) as FlagMetadata[];
}

function getTypeFromVariant(variants: FeatureFlagVariant[]): string | null {
  const variant = variants[0];

  if (!variant) {
    return null;
  }
  switch (variant.dataTypeCode) {
    case 'BOOL':
      return 'boolean';
    case 'STR':
      return variants.map((v) => `"${v.stringValue}"`).join(' | ');
    case 'NUM':
      return variants.map((v) => `${v.numberValue}`).join(' | ');
    case 'JSON':
      return 'object';
    default:
      return null;
  }
}

function generateTypes(sdkChoice: string, metadata: FlagMetadata[]): string {
  return `
// prettier-ignore-start
// eslint-disable
// tslint:disable

/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA FLAGSYNC-CLI                  ##
 * ##                                                           ##
 * ## AUTHOR: FlagSync                                          ##
 * ## SOURCE: https://github.com/flagsync/cli                   ##
 * ---------------------------------------------------------------
 */
import { FeatureFlags } from "${sdkChoice}";

declare module "${sdkChoice}" {
  export interface FeatureFlags {
${metadata.map((f) => `    "${f.key}": ${f.type};`).join('\n')}
  }
}
// prettier-ignore-end
`.trim();
}

export async function writeFilesToDisk(types: string) {
  const pkgPath = await findUp('package.json');
  if (!pkgPath) {
    throw new Error('Could not find package.json in any parent directory.');
  }

  const rootDir = path.dirname(pkgPath);
  const outputPath = path.join(rootDir, 'gen', 'flags.d.ts');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, types);

  return path.relative(rootDir, outputPath);
}
