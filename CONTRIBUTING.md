# Contributing to AgentBridge

Thank you for your interest in contributing to AgentBridge! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to help us maintain a healthy and welcoming community.

## Project Structure

AgentBridge is organized as a monorepo with the following structure:

```
packages/
├── core/                 # Core library
├── frameworks/           # Framework adapters
│   ├── react/            # React SDK
│   ├── angular/          # Angular SDK 
│   ├── react-native/     # React Native SDK
│   └── flutter/          # Flutter SDK
├── providers/            # Communication providers
│   ├── ably/             # Ably implementation
│   ├── firebase/         # Firebase implementation
│   ├── pusher/           # Pusher implementation
│   └── supabase/         # Supabase implementation
├── communication/        # Communication protocols
│   └── websocket/        # WebSocket implementation
└── server/               # Server components
```

## Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/agentbridge.git
   cd agentbridge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the packages**

   ```bash
   npm run build
   ```

4. **Run tests**

   ```bash
   npm run test
   ```

## Development Workflow

1. **Create a new branch for your feature or bugfix**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   Implement your feature or bugfix.

3. **Run linting and tests**

   ```bash
   npm run lint
   npm run test
   ```

4. **Build the packages to ensure everything compiles**

   ```bash
   npm run build
   ```

5. **Commit your changes using conventional commits**

   ```bash
   git commit -m "feat: add new feature"
   ```

   We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

6. **Push your branch and create a pull request**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then go to GitHub and create a pull request against the `main` branch.

## Working with Packages

### Creating a New Package

1. Run the placeholder generator to create a starting structure:

   ```bash
   node scripts/generate-placeholders.js
   ```

2. Implement the required functionality for your package.

3. Update the root `package.json` if necessary.

### Testing Changes Across Packages

Since packages depend on each other, you may need to test changes across multiple packages. The best way to do this is to use the workspace feature:

```bash
npm run build  # Build all packages
```

## Pull Request Process

1. Ensure your code passes all tests and linting.
2. Update documentation if necessary.
3. Add tests for new functionality.
4. Make sure your PR description clearly describes the problem and solution.
5. Request a review from at least one of the maintainers.

## Release Process

Releases are managed by the maintainers. If you'd like to request a release, please open an issue.

The release process involves:

1. Preparing packages with version updates
   ```bash
   npm run prepare-publish
   ```

2. Publishing packages to npm
   ```bash
   npm run publish-packages
   ```

## Reporting Bugs

Please report bugs by opening a new issue on GitHub. Include as much information as possible:

- Package version
- Platform/OS
- Reproduction steps
- Expected vs actual behavior
- Code examples if possible

## Suggesting Features

We welcome feature suggestions! Please open an issue describing your proposed feature, why it's valuable, and how it should work.

## License

By contributing to AgentBridge, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 