# Contributing to AgentBridge

Thank you for considering contributing to AgentBridge! This document outlines the process for contributing to the project and provides guidelines to follow.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:

1. Check the existing issues to see if the problem has already been reported
2. Try to reproduce the issue in the latest version of the package
3. Collect as much information as possible about the bug

When creating a bug report, please include:

- A clear and descriptive title
- The exact steps to reproduce the problem
- The expected behavior and what actually happened
- Code snippets or screenshots if applicable
- Your environment (OS, browser, package versions, etc.)

### Suggesting Enhancements

We welcome feature requests and improvements. When suggesting an enhancement:

1. Provide a clear and descriptive title
2. Describe the current behavior and explain the behavior you'd like to see
3. Explain why this enhancement would be useful
4. Specify which package(s) the enhancement applies to

### Pull Requests

We welcome pull requests for bug fixes, enhancements, and documentation improvements. Here's how to submit a pull request:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes, following our coding standards
4. Add or update tests as necessary
5. Update documentation if needed
6. Submit a pull request targeting the `main` branch

## Development Setup

### Prerequisites

- Node.js 16+ for JavaScript/TypeScript development
- Flutter 3.13+ for Flutter development
- Python 3.8+ for documentation

### Setting Up the Development Environment

1. Clone the repository
   ```bash
   git clone https://github.com/your-organization/agentbridge.git
   cd agentbridge
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. For Flutter development
   ```bash
   cd flutter
   flutter pub get
   ```

4. For documentation
   ```bash
   pip install mkdocs mkdocs-material pymdown-extensions
   ```

### Project Structure

- `/packages`: Contains all package source code
  - `/core`: Core functionality
  - `/react`, `/angular`, `/react-native`: Framework adapters
  - `/flutter`: Flutter package
- `/docs`: Documentation
- `/examples`: Example applications
- `/tests`: Test suite
- `/.github`: GitHub workflows

### Building

```bash
# Build all JavaScript packages
npm run build

# Build a specific package
npm run build --workspace=@agentbridge/core
npm run build --workspace=@agentbridge/react
```

For Flutter:
```bash
cd flutter
flutter build
```

### Testing

```bash
# Run all JavaScript tests
npm run test

# Run tests for a specific package
npm run test --workspace=@agentbridge/core
```

For Flutter:
```bash
cd flutter
flutter test
```

### Documentation

We use MkDocs for documentation. To serve documentation locally:

```bash
mkdocs serve
```

## Coding Standards

### JavaScript/TypeScript

- Follow ESLint rules defined in the project
- Write code in TypeScript where possible
- Use async/await for async operations
- Write comprehensive tests for new functionality

### Flutter/Dart

- Follow the official [Dart style guide](https://dart.dev/guides/language/effective-dart/style)
- Use the built-in formatter: `flutter format .`
- Run static analysis before submitting: `flutter analyze`
- Write unit tests for new functionality

## Git Workflow

- Create a branch for each feature or bug fix
- Use descriptive branch names (`feature/add-xy-feature`, `fix/issue-123`)
- Make focused, atomic commits with descriptive messages
- Rebase your branch on the latest `main` before submitting a PR

### Commit Message Format

We follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Where `type` is one of: feat, fix, docs, style, refactor, perf, test, chore

## Release Process

Release management is handled by the core team. The general process is:

1. Update version numbers according to [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Create a tag for the new version
4. Push the tag to trigger the deployment workflow

## Questions?

If you have any questions about contributing, feel free to open an issue with the "question" label.

Thank you for your contributions! 