export type CreateSessionResponse = {
  code: string;
};

export type AccessTokenResponse = {
  accessToken: string;
  csrfToken: string;
};

export type WorkspaceEnvironment = {
  environmentId: number;
  environmentName: string;
};

export type OrganizationWorkspace = {
  workspaceId: number;
  workspaceName: string;
  environments: WorkspaceEnvironment[];
};

export type UserOrganization = {
  organizationId: number;
  organizationName: string;
  workspaces: OrganizationWorkspace[];
};

export type User = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  organizations: UserOrganization[];
};

export type OrgContext = {
  organizationId: number;
  workspaceId: number;
  environmentId: number;
};

export type StoreToken = {
  context: OrgContext;
  accessToken: string;
  csrfToken: string;
};

export type EnvironmentGetResponse = {
  environment: Environment;
};

export type Environment = {
  environmentId: number;
  environmentName: string;
  featureFlagStates: FeatureFlagEnvironmentState[];
};

export type FeatureFlagEnvironmentState = {
  featureFlagEnvironmentStateId: number;
  featureFlag: FeatureFlag;
  environmentId: number;
  isEnabled: boolean;
  targetedVariantIds: number[];
  isPercentageRollout: boolean;
  isTargetedRollout: boolean;
  hasActiveExperiment: boolean;
};

export type FeatureFlag = {
  featureFlagId: number;
  name: string;
  key: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  variants: FeatureFlagVariant[];
};

export interface FeatureFlagVariant {
  variantId: number;
  dataTypeCode: 'BOOL' | 'STR' | 'NUM' | 'JSON';
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  jsonValue: object;
  numberValue: number;
  stringValue: string;
  booleanValue: boolean;
}

export type FlagMetadata = {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
};

export interface FlagSyncSdk {
  name: string;
  library: string;
  type: 'client' | 'server';
}
