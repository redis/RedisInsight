# PR Plan Command

## Purpose

Analyzes a JIRA ticket and creates a detailed implementation plan for a feature or bug fix.

## Usage

```bash
/pr:plan <ticket-id>
```

## Prerequisites

1. JIRA ticket must exist and be accessible
2. JIRA MCP tool configured
3. Ticket has clear requirements and acceptance criteria
4. Ticket scope is small and manageable

## Process

### 1. Ticket Validation

Verify ticket quality:

- [ ] Title is clear and descriptive
- [ ] Description is detailed
- [ ] Acceptance criteria defined
- [ ] Requirements are testable
- [ ] Scope is reasonable (can be completed in reasonable time)
- [ ] Dependencies are identified
- [ ] No blockers present

If ticket quality is insufficient, provide feedback on what needs improvement.

### 2. Codebase Analysis

Understand current implementation:

- Identify affected modules and files
- Review related code and patterns
- Understand data models and flow
- Identify dependencies and impacts
- Review existing tests
- Check for similar implementations

### 3. Implementation Planning

Create a detailed plan with:

- **Overview**: High-level description of changes
- **Phases**: Break down into manageable steps
- **Files to Create/Modify**: List all affected files
- **Technical Approach**: Architecture and design decisions
- **Data Model Changes**: Database/state modifications
- **API Changes**: New or modified endpoints
- **UI Changes**: Component and state management updates
- **Testing Strategy**: Unit, integration, and E2E tests
- **Risks and Considerations**: Potential issues and mitigation

### 4. Risk Assessment

Identify potential risks:

- Breaking changes
- Performance impacts
- Security concerns
- Backward compatibility
- Data migration needs
- Third-party dependencies

### 5. Testing Strategy

Define comprehensive testing:

- Unit tests for new/modified functions
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows
- Edge case scenarios
- Error handling tests

## Implementation Plan Template

````markdown
# Implementation Plan: [TICKET-ID] - [Title]

**Date**: YYYY-MM-DD
**Estimated Effort**: X hours/days
**Complexity**: Low/Medium/High
**Risk Level**: Low/Medium/High

## Overview

Brief description of what needs to be implemented and why.

## Ticket Quality Assessment

- ✅/❌ Clear requirements
- ✅/❌ Defined acceptance criteria
- ✅/❌ Reasonable scope
- ✅/❌ No blockers
- ✅/❌ Dependencies identified

## Current State Analysis

Description of current implementation and what needs to change.

### Affected Modules

- Frontend: [List modules]
- Backend: [List modules]
- Shared: [List modules]

### Related Files

- `path/to/file1.ts` - Description
- `path/to/file2.tsx` - Description

## Implementation Phases

### Phase 1: Backend API

1. Create DTOs for validation

   - File: `redisinsight/api/src/feature/dto/create-feature.dto.ts`
   - Add validation decorators
   - Define proper types

2. Implement service layer

   - File: `redisinsight/api/src/feature/feature.service.ts`
   - Business logic implementation
   - Error handling

3. Create controller endpoints

   - File: `redisinsight/api/src/feature/feature.controller.ts`
   - REST endpoints
   - Swagger documentation

4. Add unit tests
   - File: `redisinsight/api/src/feature/feature.service.spec.ts`
   - Test all service methods
   - Mock dependencies

### Phase 2: Frontend State Management

1. Create Redux slice

   - File: `redisinsight/ui/src/slices/feature/feature.ts`
   - Define state interface
   - Create reducers and actions

2. Implement selectors

   - File: `redisinsight/ui/src/slices/feature/selectors.ts`
   - Memoized selectors
   - Derived state

3. Create thunks for API calls
   - File: `redisinsight/ui/src/slices/feature/thunks.ts`
   - Async actions
   - Error handling

### Phase 3: Frontend UI Components

1. Create component folder structure

   - Folder: `redisinsight/ui/src/components/Feature/`
   - Follow component guidelines structure:
     - `Feature.tsx` - Main component
     - `Feature.spec.tsx` - Component tests
     - `Feature.styles.ts` - Styled components
     - `Feature.types.ts` - Type definitions
     - `index.ts` - Barrel file (if 3+ exports)

2. Implement styled components

   - File: `redisinsight/ui/src/components/Feature/Feature.styles.ts`
   - Use styled-components
   - Export styled elements (Container, Title, etc.)
   - Follow naming: Styled prefix (e.g., StyledContainer)

3. Create main feature component

   - File: `redisinsight/ui/src/components/Feature/Feature.tsx`
   - Functional component with TypeScript
   - Props interface in Feature.types.ts
   - State integration with Redux hooks
   - Import styled components

4. Create sub-components (if needed)

   - Folder: `redisinsight/ui/src/components/Feature/components/`
   - Each sub-component follows same structure
   - Keep component-specific utilities in Feature/utils/
   - Keep component-specific hooks in Feature/hooks/

5. Add component tests
   - File: `redisinsight/ui/src/components/Feature/Feature.spec.tsx`
   - Render tests
   - Interaction tests
   - Use Testing Library
   - Use faker for test data

### Phase 4: Integration & Testing

1. Integration tests

   - File: `redisinsight/api/test/api/feature.e2e.spec.ts`
   - Test API endpoints
   - Test error scenarios

2. E2E tests

   - File: `tests/e2e/tests/feature/feature.e2e.ts`
   - Critical user flows
   - Cross-browser testing

3. Manual testing checklist
   - [ ] Happy path flow
   - [ ] Error scenarios
   - [ ] Edge cases
   - [ ] Performance
   - [ ] Accessibility

## Technical Approach

### Data Model

```typescript
interface Feature {
  id: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
```
````

### API Endpoints

- `GET /api/feature` - List all features
- `GET /api/feature/:id` - Get feature by ID
- `POST /api/feature` - Create new feature
- `PUT /api/feature/:id` - Update feature
- `DELETE /api/feature/:id` - Delete feature

### State Structure

```typescript
interface FeatureState {
  features: Feature[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}
```

## Testing Strategy

### Backend Tests

1. **Unit Tests** (feature.service.spec.ts)

   - Test all service methods
   - Mock database calls
   - Test error handling
   - Coverage: >80%

2. **Integration Tests** (feature.e2e.spec.ts)
   - Test API endpoints
   - Test validation
   - Test database persistence
   - Test error responses

### Frontend Tests

1. **Unit Tests** (thunks.spec.ts, selectors.spec.ts)

   - Test Redux logic
   - Test selectors
   - Test async actions
   - Coverage: >80%

2. **Component Tests** (Feature.spec.tsx)

   - Test rendering
   - Test user interactions
   - Test error states
   - Test loading states
   - Use faker for data
   - No fixed timeouts

3. **E2E Tests** (feature.e2e.ts)
   - Test complete user flow
   - Test cross-component interaction
   - Test real API integration

## Risks and Considerations

### Technical Risks

1. **Performance Risk** (Medium)

   - Large dataset rendering
   - Mitigation: Implement virtualization

2. **Breaking Change Risk** (Low)
   - New API endpoints only
   - No modification to existing APIs

### Dependencies

- No external dependencies required
- Uses existing Redux patterns
- Uses existing UI components

### Performance Impact

- Minimal - new feature only
- Consider lazy loading for the module

### Security Considerations

- Input validation with class-validator
- Output sanitization in UI
- Authorization checks in API

## Acceptance Criteria Mapping

1. ✅ User can create new feature

   - Backend: POST endpoint
   - Frontend: Form component
   - Tests: Integration + E2E

2. ✅ User can view features

   - Backend: GET endpoint
   - Frontend: List component
   - Tests: Component + E2E

3. ✅ User can edit features

   - Backend: PUT endpoint
   - Frontend: Edit form
   - Tests: Integration + E2E

4. ✅ User can delete features
   - Backend: DELETE endpoint
   - Frontend: Delete button
   - Tests: Integration + E2E

## Timeline Estimate

| Phase                     | Duration     | Notes              |
| ------------------------- | ------------ | ------------------ |
| Phase 1: Backend          | 4 hours      | API + Tests        |
| Phase 2: State Management | 3 hours      | Redux + Tests      |
| Phase 3: UI Components    | 5 hours      | Components + Tests |
| Phase 4: Integration      | 2 hours      | E2E + Manual       |
| **Total**                 | **14 hours** | **~2 days**        |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit test coverage >80%
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] No linting errors
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Manual testing completed

## Next Steps

1. Review and approve this plan
2. Create feature branch
3. Implement Phase 1
4. Review Phase 1 before moving to Phase 2
5. Continue iteratively through phases
6. Final review and testing
7. Create PR for review

```

## Plan Review Guidelines

Before executing the plan:
1. **Review completeness**: All requirements covered?
2. **Check feasibility**: Is the approach practical?
3. **Verify estimates**: Are timelines realistic?
4. **Assess risks**: Are mitigation strategies adequate?
5. **Validate testing**: Is testing strategy comprehensive?

## Execution Guidelines

After plan approval:
1. Create feature branch
2. Implement phase by phase
3. Commit after each logical unit
4. Run tests continuously
5. Run linter frequently
6. Update plan if needed
7. Document deviations from plan

## Notes
- Keep ticket scope small for better planning
- Break large features into multiple tickets
- Update plan if requirements change
- Document technical decisions
- Get clarification on ambiguous requirements

```
