# Pull Request Guidelines

## Creating a PR

### PR Title

Include issue number at the start:

```
RI-123 Add user profile editing
#456 Fix memory leak in connection pool
```

### PR Description Template

```markdown
# What

Describe what was changed.

# Testing

Describe how to test the changes.

---

Closes #RI-123
```

## Review Process

### As PR Author

- **Respond to all comments** - Address every piece of feedback
- **Don't take feedback personally** - Reviews improve code quality
- **Update code based on feedback** - Make requested changes
- **Mark conversations as resolved** - After addressing feedback
- **Keep PR up to date** - Rebase on main regularly

### As PR Reviewer

- **Be constructive and respectful** - Focus on improvement
- **Focus on logic, not style** - Linter handles formatting
- **Check for**:
  - Logic errors and edge cases
  - Performance issues
  - Security concerns
  - Test coverage
  - Missing documentation
  - Architectural concerns

### Review Checklist

- [ ] Code follows project patterns
- [ ] Tests are comprehensive
- [ ] No console.log or debug code
- [ ] TypeScript types are proper
- [ ] Error handling is adequate
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
