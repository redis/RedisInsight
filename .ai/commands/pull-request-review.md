# PR Review Command

## Purpose

Reviews code changes in the current branch against requirements, best practices, and project standards.

## Usage

```bash
/pr:review <ticket-id>
```

**Examples**:

- JIRA ticket: `/pr:review RI-1234`
- GitHub issue: `/pr:review 456`

## Prerequisites

1. Checkout the branch to review locally
2. Ensure the ticket ID is valid and accessible
3. Have JIRA MCP tool configured (if using JIRA integration)

## Process

### 1. Gather Context

- Fetch JIRA ticket details (if available)
- Read requirements and acceptance criteria
- Identify affected files in the PR
- Review recent commits

### 2. Code Analysis

Analyze the changes against:

- **Code Quality**: Linting rules, TypeScript types, complexity
- **Testing**: Test coverage, test quality, edge cases
- **Performance**: Rendering optimizations
- **Security**: Input validation, XSS prevention, credential handling
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Best Practices**: React patterns, Redux usage, NestJS conventions

### 3. Requirements Check

- Verify all acceptance criteria are met
- Check for missing functionality
- Validate edge case handling
- Ensure proper error messages

### 4. Testing Validation

- Unit test coverage (80% minimum)
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical flows
- No fixed timeouts or magic numbers
- Use of faker for test data

### 5. Generate Report

Create a markdown report in `docs/reviews/pr-<ticket-id>-<date>.md` with:

**Note**: Use appropriate ticket reference format:

- JIRA tickets: `pr-RI-1234-2024-11-20.md`
- GitHub issues: `pr-456-2024-11-20.md`

Report should include:

- **Summary**: Overview of changes
- **Strengths**: What was done well
- **Issues**: Categorized by severity (Critical, High, Medium, Low)
- **Suggestions**: Improvements and optimizations
- **Requirements Coverage**: Acceptance criteria checklist
- **Testing Assessment**: Coverage and quality analysis
- **Risk Assessment**: Potential issues or impacts

## Review Checklist

### Code Quality

- [ ] No linting errors
- [ ] TypeScript types are proper (no `any` without justification)
- [ ] Code follows project conventions
- [ ] No console.log statements
- [ ] Import order is correct
- [ ] Cognitive complexity within limits
- [ ] No duplicate code

### Testing

- [ ] Unit tests added/updated
- [ ] Test coverage meets thresholds
- [ ] Tests use faker for data generation
- [ ] No fixed timeouts in tests
- [ ] Edge cases are tested
- [ ] Mocks are properly configured

### React/Frontend (if applicable)

- [ ] Functional components with hooks
- [ ] Proper state management (Redux vs local)
- [ ] Effects cleanup properly
- [ ] No unnecessary re-renders
- [ ] Accessibility considerations
- [ ] Styled-components for styling (no new SCSS modules)
- [ ] Proper error boundaries
- [ ] Component folder structure follows guidelines

### NestJS/Backend (if applicable)

- [ ] Dependency injection used properly
- [ ] DTOs for validation
- [ ] Proper error handling
- [ ] Swagger documentation
- [ ] Service layer separation
- [ ] Database transactions where needed

### Performance

- [ ] No performance regressions
- [ ] Large lists virtualized
- [ ] Routes lazy loaded
- [ ] Expensive operations memoized
- [ ] Bundle size impact acceptable

### Security

- [ ] Input validation
- [ ] Output sanitization
- [ ] No sensitive data in logs
- [ ] Proper authentication/authorization
- [ ] SQL injection prevention (if applicable)

### Documentation

- [ ] README updated if needed
- [ ] Complex logic documented
- [ ] API documentation updated
- [ ] Breaking changes noted

## Example Output

**Note**: Use appropriate ticket format (RI-1234 for JIRA or #456 for GitHub issues)

```markdown
# PR Review: RI-1234 - Add User Profile Editing

**Date**: 2024-11-20
**Reviewer**: AI Assistant
**Branch**: feature/RI-1234/user-profile-editing

## Summary

This PR implements user profile editing functionality including UI components,
API endpoints, and data persistence. The implementation follows project
standards with good test coverage.

## High Priority Issues

1. **Missing Input Validation** (Security)
   - File: `garnetinsight/api/src/user/user.service.ts:45`
   - Issue: Email validation missing on backend
   - Recommendation: Add class-validator decorator to DTO

## Medium Priority Issues

1. **Performance Concern** (Performance)

   - File: `garnetinsight/ui/src/components/UserProfile.tsx:78`
   - Issue: Inline function in render
   - Recommendation: Extract to useCallback

2. **Test Flakiness Risk** (Testing)
   - File: `garnetinsight/ui/src/components/UserProfile.spec.tsx:45`
   - Issue: Direct state check without waitFor
   - Recommendation: Wrap assertion in waitFor

## Low Priority Issues

1. **Code Style** (Style)
   - File: Multiple files
   - Issue: Inconsistent import ordering
   - Recommendation: Run `yarn prettier:fix`

## Risk Assessment

**Low Risk** - Well-tested implementation with minor issues that can be
addressed before merge. No breaking changes or security vulnerabilities.

## Recommendation

**Approve with comments** - Address high priority issues before merging.
Consider suggestions for future improvements.
```

## Notes

- Focus on constructive feedback
- Prioritize issues by severity
- Be specific with file locations and line numbers
- Provide actionable recommendations
- Balance criticism with recognition of good practices
- Consider the broader impact of changes
