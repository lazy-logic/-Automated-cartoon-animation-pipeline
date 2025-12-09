# Contributing to Automated Cartoon Animation Pipeline

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project follows a professional code of conduct:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the project
- Show empathy towards other contributors

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/-Automated-cartoon-animation-pipeline.git
   cd -Automated-cartoon-animation-pipeline
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### Making Changes

1. Make your changes in your feature branch
2. Write or update tests as needed
3. Ensure your code follows the coding standards
4. Test your changes thoroughly

### Committing

Use clear and descriptive commit messages following this format:

```
<type>: <subject>

<body (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add character rotation controls"
git commit -m "fix: resolve timeline scrubbing issue"
git commit -m "docs: update API reference for story generation"
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` unless absolutely necessary
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing with TypeScript

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  // Component logic
}
```

### File Organization

- Place React components in `components/` subdirectories
- Place business logic in `lib/` subdirectories
- Place API routes in `app/api/`
- Use clear, descriptive filenames

### Styling

- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Follow the existing design patterns
- Ensure responsive design

### Code Formatting

- Run ESLint before committing:
  ```bash
  npm run lint
  ```

## Submitting Changes

### Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub

4. **Fill out the PR template** with:
   - Clear description of changes
   - Related issue numbers (if applicable)
   - Screenshots/videos for UI changes
   - Testing instructions

5. **Wait for review** - maintainers will review your PR

### PR Requirements

- ✅ All tests pass
- ✅ No linting errors
- ✅ Code follows project standards
- ✅ Documentation updated (if needed)
- ✅ Branch is up to date with main

## Reporting Bugs

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the bug
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots or videos** (if applicable)
6. **Environment details**:
   - OS (Windows/Mac/Linux)
   - Browser (if applicable)
   - Node.js version
   - npm version

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., v18.17.0]
```

## Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Clearly describe the feature** and its benefits
3. **Provide use cases** for the feature
4. **Include mockups or examples** (if applicable)

**Feature Request Template:**

```markdown
**Feature Description**
A clear description of the feature.

**Problem it solves**
What problem does this feature address?

**Proposed solution**
How should this feature work?

**Alternatives considered**
Any alternative solutions you've considered.
```

## Questions?

If you have questions about contributing:

1. Check the [README.md](README.md) documentation
2. Open a GitHub Discussion
3. Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making this project better! 🎨
