# FlagSync CLI

The **FlagSync CLI** is a tool for generating TypeScript type definitions for feature flags
managed in [FlagSync](https://www.flagsync.com), keeping your code type-safe and reliable.

## Usage

Get started by installing the CLI in your project:

```sh
npm i @flagsync/cli -D
```

Then run the `generate` command to generate TypeScript types for your feature flags:

```sh
npx flagsync generate
```

## Commands

### `login`

Authenticate your CLI session with your FlagSync account:

```sh
npx flagsync login
```

- Opens a browser window for authentication.
- Prompts you to select your organization and workspace after login.

### `generate`

Generate TypeScript types for your feature flags:

```sh
npx flagsync generate
```

- Prompts you to select your SDK (e.g., React, Node.js).
- Fetches your feature flags and generates a `flags.d.ts` file.

### `logout`

Remove your local session and credentials:

```sh
npx flagsync logout
```

## Supported SDKs

- [`@flagsync/react-sdk`](https://github.com/flagsync/react-sdk)
- [`@flagsync/js-sdk`](https://github.com/flagsync/js-sdk)
- [`@flagsync/node-sdk`](https://github.com/flagsync/node-sdk)
- [`@flagsync/nextjs-sdk`](https://github.com/flagsync/nextjs-sdk)
- [`@flagsync/nestjs-sdk`](https://github.com/flagsync/nestjs-sdk)

## Development

```sh
# Build the CLI
pnpm build

# Run the CLI locally
pnpm flagsync [command]

# Lint and format code
pnpm lint
pnpm format
```

## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/flagsync/cli).
