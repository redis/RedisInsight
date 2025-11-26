---
description: Analyze a JIRA ticket and create a detailed implementation plan
argument-hint: <ticket-id or ticket-url>
---

Create a comprehensive implementation plan for a JIRA ticket.

## 1. Fetch JIRA Ticket

**If ticket ID is not provided as an argument, prompt the user for it.**

Fetch all the information from the ticket, its comments, linked documents, and parent ticket.

Use the `jira` tool to fetch the ticket details.

## 4. Create Implementation Plan

Use `sequential-thinking` tool for complex analysis. Break down into thoughts:

### Thought 1-5: Requirements Analysis

- Parse acceptance criteria into specific tasks
- Identify functional requirements
- Identify non-functional requirements (performance, security, cost)
- Map requirements to system components
- Identify dependencies and blockers

### Thought 6-10: Architecture Planning

- Determine which services are affected
- Identify new components needed
- Identify existing components to modify
- Plan data flow and interactions
- Consider error handling and edge cases

### Thought 16-20: Implementation Breakdown

- Break work into logical phases
- Identify dependencies between phases
- Consider testing strategy for each phase
- Plan for incremental delivery

### Thought 21-25: Testing Strategy

- Identify test scenarios from acceptance criteria
- Plan unit tests (behavior-based, not implementation)
- Plan integration tests
- Consider edge cases and error scenarios
- Plan test data needs

### Thought 26-30: Risk Assessment

- Identify technical risks
- Identify integration risks
- Identify timeline risks
- Identify knowledge gaps
- Plan mitigation strategies

## 5. Generate Implementation Plan Document

**CRITICAL: You MUST create and save a plan document. This is NOT optional.**

Create a comprehensive Markdown document and save it to `docs/pr-plan-{ticket-id}-{brief-description}.md` using the `write` tool.

**The document structure MUST include all sections below:**

```markdown
# Implementation Plan: [Ticket Title]

**JIRA Ticket:** [MOD-XXXXX](https://redislabs.atlassian.net/browse/MOD-XXXXX)
**Epic:** [EPIC-XXX](link) (if applicable)
**Parent:** [PARENT-XXX](link) (if applicable)
**Plan Date:** [Date]
**Planner:** Augment Agent

---

## Executive Summary

**Components Affected:**

- [component name]

**Key Risks:**

1. [Risk with mitigation]
2. [Risk with mitigation]
3. [Risk with mitigation]

---

## 1. Requirements Summary

**Story (Why):**
[Quote or summarize the story from the ticket]

**Acceptance Criteria (What):**

1. [AC1]
2. [AC2]
3. [AC3]

**Functional Requirements:**

- [Requirement 1]
- [Requirement 2]

**Non-Functional Requirements:**

- [NFR 1 - e.g., Performance: <100ms response time]
- [NFR 2 - e.g., Security: Requires authentication]

**Resources Provided:**

- [Link 1: Description]
- [Link 2: Description]

## 2. Current State Analysis

### Frontend Changes

**Components to Modify:**

- [Component 1]: [What changes are needed]
- [Component 2]: [What changes are needed]

**Components to Create:**

- [Component 1]: [Why it's needed]
- [Component 2]: [Why it's needed]

**Components to Reuse:**

- [Component 1]: [How it will be used]
- [Component 2]: [How it will be used]

### Backend Changes

**Services to Modify:**

- [Service 1]: [What changes are needed]
- [Service 2]: [What changes are needed]

**Services to Create:**

- [Service 1]: [Why it's needed]
- [Service 2]: [Why it's needed]

**APIs to Modify:**

- [API 1]: [What's changing]
- [API 2]: [What's changing]

**APIs to Create:**

- [API 1]: [Why it's needed]
- [API 2]: [Why it's needed]

**Data Models:**

- [Model 1]: [Description and whether it needs extension]
- [Model 2]: [Description and whether it needs extension]

**Repositories:**

- [Repo 1]: [Description and whether it can be reused]

---

## 3. Implementation Plan

### Phase 1: [Phase Name]

**Goal:** [What this phase achieves]

**Tasks:**

1. [ ] [Task 1 - specific, actionable]
   - Files: [List of files to create/modify]
   - Acceptance: [How to verify this task is done]
2. [ ] [Task 2]
   - Files: [List of files]
   - Acceptance: [Verification criteria]

**Deliverables:**

- [Deliverable 1]
- [Deliverable 2]

**Testing:**

- [Test scenario 1]
- [Test scenario 2]

### Phase 2: [Phase Name]

[Same structure as Phase 1]

### Phase 3: [Phase Name]

[Same structure as Phase 1]

---

## 5. Testing Strategy

### Test Scenarios (from Acceptance Criteria)

**AC1: [Acceptance Criterion]**

- Test Scenario: [Given-When-Then]
- Test Type: Unit/Integration
- Test Location: [File path]

**AC2: [Acceptance Criterion]**

- Test Scenario: [Given-When-Then]
- Test Type: Unit/Integration
- Test Location: [File path]

### Edge Cases and Error Scenarios

1. **[Edge Case 1]**

   - Scenario: [Description]
   - Expected Behavior: [What should happen]
   - Test: [How to test]

2. **[Error Scenario 1]**
   - Scenario: [Description]
   - Expected Error: [Error type/code]
   - Test: [How to test]

### Test Data Needs

- [Test data 1]: [Description]
- [Test data 2]: [Description]

---

## 6. Risk Assessment and Mitigation

### Technical Risks

| Risk     | Likelihood      | Impact          | Mitigation            |
| -------- | --------------- | --------------- | --------------------- |
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |

### Integration Risks

| Risk     | Likelihood      | Impact          | Mitigation            |
| -------- | --------------- | --------------- | --------------------- |
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |

### Timeline Risks

| Risk     | Likelihood      | Impact          | Mitigation            |
| -------- | --------------- | --------------- | --------------------- |
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |

### Knowledge Gaps

- [Gap 1]: [What we don't know and how to find out]
- [Gap 2]: [What we don't know and how to find out]
```

---

## 6. Save the Plan Document

**CRITICAL: You MUST save the plan document using the `write` tool.**

1. **Generate the complete plan document** following the structure in section 5
2. **Save it** to `docs/pr-plan-{ticket-id}-{brief-description}.md` using `write` tool
3. **Verify the file was created** by confirming the write tool succeeded

**Example filename:** `docs/pr-plan-MOD-11280-dp-services-clean-architecture.md`

---

## 7. Follow-up Actions

After saving the plan document:

1. **Confirm document was saved** - Show the file path to the user
2. **Summarize key findings** for the user:
   - Key risks
   - Recommended approach
   - **Confirm plan document was saved** (file path)
3. **Ask if user wants to:**
   - Review the plan document
   - Proceed with implementation

---

## Important Notes

- **ALWAYS save the plan document** - use `write` tool to save to `docs/pr-plan-{ticket-id}-{brief-description}.md`
- **Use main branch as baseline** - all analysis should be against current main
- **Be specific and actionable** - every task should be clear and verifiable
- **Consider PR stacking** - plan for small, reviewable PRs (see `.ai/rules/pull-requests.md`). plan breaking the implementation in a stack of PRs.
- **Follow all project standards** - reference rules in `.ai/rules/`
- **Document assumptions** - if anything is unclear, document the assumption made
- **Identify blockers early** - surface dependencies and knowledge gaps upfront

## Execution Order Summary

**The correct order of operations is:**

1. ✅ Fetch JIRA ticket
2. ✅ Analyze current codebase state
3. ✅ Create implementation plan using sequential-thinking
4. ✅ Generate implementation plan document content
5. ✅ **Save plan document to `docs/pr-plan-{ticket-id}-{brief-description}.md`** (CRITICAL - use write tool)
6. ✅ Present results to user and confirm document location

**Do NOT skip step 5 - it is mandatory and must be done during command execution.**

**Step 5 is MANDATORY:** You MUST use the `write` tool to save the plan document. Do NOT just present the plan to the user without saving it.
