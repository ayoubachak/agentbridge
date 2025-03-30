# Package Deployment Guide

This document provides instructions for deploying the AgentBridge packages to package registries and integrating them into applications.

## Package Structure

AgentBridge consists of several packages that can be deployed independently:

```
@agentbridge/core        - Core functionality, platform-agnostic
@agentbridge/react       - React integration
@agentbridge/angular     - Angular integration  
@agentbridge/react-native - React Native integration
agentbridge              - Flutter integration package
```

## Prerequisites

Before deploying the packages, ensure you have:

- Node.js 14.x or higher (for JavaScript packages)
- npm 7.x or higher or yarn 1.22.x or higher
- Flutter 3.0.0 or higher (for Flutter package)
- Access to the package registries (npm, pub.dev)
- Appropriate authentication credentials

## Version Management

AgentBridge follows [Semantic Versioning](https://semver.org/) (SemVer) for all packages:

- **Major version**: Breaking changes that require code updates in consuming applications
- **Minor version**: New features added in a backward-compatible manner
- **Patch version**: Backward-compatible bug fixes

All packages should be versioned together to maintain compatibility.

## Building Packages for Deployment

### JavaScript Packages (Core, React, Angular, React Native)

1. Clean the build artifacts:

```bash
npm run clean
```

2. Install dependencies:

```bash
npm install
```

3. Build the packages:

```bash
npm run build
```

4. Run tests to ensure everything works:

```bash
npm test
```

### Flutter Package

1. Ensure your Flutter environment is set up:

```bash
flutter doctor
```

2. Run tests:

```bash
flutter test
```

3. Analyze the code:

```bash
flutter analyze
```

## Publishing Packages

### Publishing JavaScript Packages to npm

1. Log in to npm:

```bash
npm login
```

2. Publish the packages in the correct order (core first, then the framework-specific packages):

```bash
# In the core package directory
npm publish --access public

# In the React package directory
npm publish --access public

# In the Angular package directory
npm publish --access public

# In the React Native package directory
npm publish --access public
```

### Publishing the Flutter Package to pub.dev

1. Review the package with the dry-run command:

```bash
flutter pub publish --dry-run
```

2. Publish the package:

```bash
flutter pub publish
```

## CI/CD Integration

AgentBridge includes GitHub Actions workflows for automated testing, documentation building, and package deployment.

### Development Workflow

The development workflow runs on every push to the main and develop branches, as well as on pull requests targeting these branches. It includes the following jobs:

- Linting JavaScript and TypeScript code
- Running JavaScript/TypeScript tests with coverage reporting
- Building JavaScript/TypeScript packages
- Linting Flutter code
- Running Flutter tests with coverage reporting 
- Building and validating documentation

This workflow ensures that code quality is maintained throughout the development process.

```yaml
# .github/workflows/development.yml
name: AgentBridge Development

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  lint-js:
    name: Lint JavaScript
    # ... job details ...

  test-js:
    name: Test JavaScript
    # ... job details ...

  # ... other jobs ...
```

### Documentation Deployment

The documentation deployment workflow automatically publishes the documentation site to GitHub Pages whenever changes are made to the documentation files or when manually triggered:

```yaml
# .github/workflows/docs-deployment.yml
name: Deploy Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
      - 'mkdocs.yml'
  workflow_dispatch:

# ... jobs ...
```

### Package Deployment

Package deployment is automated through a GitHub Actions workflow that is triggered when a version tag is pushed to the repository or manually through the GitHub interface.

The workflow executes the following steps:

1. Run tests for all packages
2. Build all packages
3. Publish JavaScript packages to npm
4. Publish the Flutter package to pub.dev
5. Create a GitHub release with notes

```yaml
# .github/workflows/package-deployment.yml
name: AgentBridge Package Deployment

on:
  push:
    tags:
      - 'v*.*.*' # Run workflow on version tags, e.g. v1.0.0
  workflow_dispatch: # Allow manual triggering

# ... jobs ...
```

### Release Process

To release a new version of AgentBridge packages, follow these steps:

1. Update version numbers in all package.json files and pubspec.yaml
2. Update CHANGELOG.md with the changes in the new version
3. Commit the version changes with a message like "chore: bump version to x.y.z"
4. Create and push a new tag:
   ```bash
   git tag -a vx.y.z -m "Release vx.y.z"
   git push origin vx.y.z
   ```
5. The package deployment workflow will automatically publish all packages to their respective registries

### Managing Environment Secrets

The following GitHub repository secrets need to be configured for the workflows to function properly:

- `NPM_TOKEN`: Access token for publishing to npm
- `PUB_DEV_CREDENTIALS`: Credentials JSON for publishing to pub.dev
- `CODECOV_TOKEN`: Token for uploading coverage reports to Codecov

To add these secrets, go to your GitHub repository settings → Secrets and variables → Actions → New repository secret.

### Monitoring Deployments

You can monitor the status of deployments in the "Actions" tab of your GitHub repository. Each workflow run will show detailed logs and any errors that might occur during the deployment process.

## Package Registry Security

### npm Package Security

- Use two-factor authentication (2FA) for the npm account
- Configure package access to restrict who can publish
- Add `.npmignore` files to exclude unnecessary files from the package

### pub.dev Package Security

- Use Google accounts with strong security measures
- Keep credentials secure and never commit them to the repository
- Follow pub.dev security best practices

## Versioning and Changelogs

Each package should maintain a `CHANGELOG.md` file that documents changes between versions. Here's a sample format:

```markdown
# Changelog

## 1.1.0 (2023-08-15)

### Features
- Added support for custom component types
- Improved error handling for function calls

### Fixes
- Fixed issue with component registration in React adapter
- Resolved type validation bug in core package

## 1.0.0 (2023-07-01)

Initial stable release.
```

## Release Checklist

Before releasing a new version, complete this checklist:

1. Update version numbers in all package.json/pubspec.yaml files
2. Update CHANGELOG.md files with all notable changes
3. Ensure all tests pass across all packages
4. Verify cross-package compatibility
5. Build all packages to ensure they compile correctly
6. Create a GitHub release with appropriate tags
7. Deploy packages to registries
8. Verify that packages can be installed and used in sample applications

## Backward Compatibility

When deploying new versions, consider the following to maintain backward compatibility:

- Avoid removing public APIs without proper deprecation notices
- Provide migration guides for major version upgrades
- Test with previous versions to identify potential issues
- Add feature flags for new functionality that might impact existing behavior

## Managing Dependencies

- Keep dependencies up to date but stable
- Lock dependency versions to prevent unexpected changes
- Test with both minimum and latest dependency versions
- Document any specific dependency requirements

## Troubleshooting Deployment Issues

### Common npm Deployment Issues

- **Authentication errors**: Ensure your npm token is valid and you have the correct permissions
- **Version conflicts**: Make sure you're not trying to publish a version that already exists
- **Package size issues**: Check for large files that should be excluded in .npmignore

### Common pub.dev Deployment Issues

- **Pub points**: Address issues that might reduce pub points score
- **Analysis issues**: Fix any code quality issues reported by the analyzer
- **Dependency conflicts**: Resolve any conflicts in the dependency graph

## Post-Deployment Verification

After deploying packages, verify that:

1. Packages can be installed from the registries
2. Sample applications work with the new versions
3. Documentation reflects the current API and features
4. Release notes are clear and complete

## Canary Releases

For testing new features before a full release, consider using canary releases:

```bash
# For npm packages
npm publish --tag canary

# For Flutter packages
# Use a version suffix like "1.0.0-canary.1" in pubspec.yaml
flutter pub publish --preview
```

## Rolling Back Releases

If issues are discovered after deployment:

### npm Packages

```bash
npm deprecate @agentbridge/package@version "Critical issues found, please use version X.Y.Z instead"
```

### Flutter Packages

Flutter packages cannot be unpublished, but you can:

1. Quickly release a patch version that fixes the issue
2. Mark the problematic version as discontinued in the package documentation 