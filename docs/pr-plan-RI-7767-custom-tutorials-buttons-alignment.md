# Implementation Plan: \[Tutorials] Custom tutorials buttons are not aligned

**JIRA Ticket:** [RI-7767](https://redislabs.atlassian.net/browse/RI-7767) (Bug Fix)
**Plan Date:** 2025-12-03
**Planner:** Augment Agent
**Branch:** `fe/bugfix/RI-7767/custom-tutorials-buttons-alignment`

***

## Executive Summary

**Components Affected:**

* `Navigation` component (remove welcome screen logic, always show form when empty)
* `Group` component (fix + button and delete icon alignment with chevron)
* `UploadTutorialForm` component (remove Cancel button, update onboarding anchor)
* `WelcomeMyTutorials` component (remove component entirely)

**Key Risks:**

1. **State management changes** - Removing `isCreateOpen` toggle might affect other logic. Mitigation: Carefully review Navigation.tsx to ensure no other dependencies on this state.
2. **Onboarding anchor change** - Moving onboarding from + button to file picker might require anchor position adjustments. Mitigation: Test onboarding flow thoroughly, adjust `anchorPosition` if needed.
3. **Test updates required** - Many tests reference welcome screen and + button. Mitigation: Update all affected tests, ensure test coverage maintained.
4. **Delete icon alignment** - May require CSS adjustments that affect other accordion items. Mitigation: Use specific selectors, test with multiple tutorials.

***

## 1. Requirements Summary

**Story (Why):**
Some spacings and alignments in the custom tutorials section are not good. The UX flow needs to be simplified by removing the welcome screen, showing the form directly when the section is empty. The + button should remain for when tutorials exist, but needs to be aligned with the chevron.

**Acceptance Criteria (What):**

1. Remove the welcome tutorial screen, leave only the add new tutorial form
2. Remove all the logic behind the welcome tutorial screen
3. The + icon should be aligned with the accordion chevron icon (remains visible when tutorials exist)
4. The delete icon needs to be aligned with the accordion chevron icon
5. Cancel button is no longer needed
6. Update the onboarding to show around the file picker

**Functional Requirements:**

* When "My Tutorials" section is open and empty, show UploadTutorialForm directly (no welcome screen, no + button)
* When "My Tutorials" section has tutorials, show tutorials list with + button to open form
* * button must be vertically aligned with accordion chevron icon
* Delete icon button must be vertically aligned with accordion chevron icon
* Remove Cancel button from UploadTutorialForm
* Onboarding tour must target file picker instead of + button (when form is shown)
* Form submission and tutorial upload must continue to work

**Non-Functional Requirements:**

* Maintain existing functionality (upload, delete, navigation)
* Onboarding flow must continue to work correctly with new anchor
* No breaking changes to other parts of the system
* Visual consistency with design specifications

**Resources Provided:**

* Design image: `image-20251203-132723.png` (attached to JIRA ticket)
* Design image: `image-20251126-150847.png` (attached to JIRA ticket)
* Test file: `tutorial.zip` (for testing upload functionality)

***

## 2. Current State Analysis

### Frontend Changes

**Components to Modify:**

* **Navigation.tsx** (`redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/Navigation/Navigation.tsx`):
  * Current: Uses `isCreateOpen` state to toggle between WelcomeMyTutorials and UploadTutorialForm
  * Current: Shows WelcomeMyTutorials when `!isCreateOpen && children?.length === 0`
  * Current: Shows UploadTutorialForm when `isCreateOpen`
  * Changes needed:
    * Remove `isCreateOpen` state
    * Remove conditional rendering of WelcomeMyTutorials
    * Always show UploadTutorialForm when `children?.length === 0` and section is open
    * Remove `onCreate` callback from Group component (no longer needed)

* **Group.tsx** (`redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/Group/Group.tsx`):
  * Current: Renders + button wrapped in OnboardingTour when `isGroupOpen || forceState === 'open'`
  * Current: + button calls `handleCreate` which triggers `onCreate` callback
  * Changes needed:
    * Keep + button but fix alignment with chevron icon
    * Keep `handleCreate` function and `onCreate` prop (needed when tutorials exist)
    * Ensure + button aligns with chevron (may need CSS adjustments)
    * Ensure delete icon alignment with chevron (may need CSS adjustments)
    * Move OnboardingTour from + button to UploadTutorialForm (file picker)

* **Group/styles.scss** (`redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/Group/styles.scss`):
  * Current: `.group-header__btn` has width/height 24px with flex alignment
  * Current: `.group-header__delete-btn` has specific icon sizing (14px)
  * Changes needed:
    * Verify + button aligns with accordion chevron
    * Verify delete icon aligns with accordion chevron
    * May need to adjust icon sizes or container alignment
    * Ensure consistent alignment for all header buttons

* **UploadTutorialForm.tsx** (`redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/UploadTutorialForm/UploadTutorialForm.tsx`):
  * Current: Has Cancel button that calls `onCancel?.()`
  * Current: Cancel and Submit buttons in `.footerButtons` div
  * Current: File picker has `data-testid="import-tutorial"`
  * Changes needed:
    * Remove Cancel button (lines 107-113)
    * Remove `onCancel` prop
    * Update footer layout (remove Cancel, keep Submit)
    * Wrap RiFilePicker with OnboardingTour component
    * Move OnboardingTour from Group to UploadTutorialForm

* **UploadTutorialForm/styles.module.scss** (`redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/UploadTutorialForm/styles.module.scss`):
  * Current: `.footerButtons` uses flex layout
  * Current: `.btnSubmit` has `margin-left: 6px`
  * Changes needed:
    * Update footer layout since Cancel button removed
    * Remove `.btnSubmit` margin-left (no longer needed)
    * Simplify footer styles

**Components to Remove:**

* **WelcomeMyTutorials**: Remove component entirely (delete component files)
  * `WelcomeMyTutorials.tsx`
  * `WelcomeMyTutorials.styles.ts` (or `.scss` if exists)
  * `WelcomeMyTutorials.spec.tsx`
  * `index.ts` (barrel export)

**Components to Reuse:**

* **RiAccordion**: Already handles action button layout, just needs alignment fixes
* **OnboardingTour**: Move from Group to UploadTutorialForm, target file picker
* **RiFilePicker**: Wrap with OnboardingTour for onboarding
* **DeleteTutorialButton**: Ensure proper alignment with chevron

### Backend Changes

**No backend changes required** - This is a pure frontend UI/UX change.

***

## 3. Implementation Plan

### Phase 1: Remove Welcome Screen and Update Form Display Logic

**Goal:** Remove welcome screen, show form directly when empty, keep + button for when tutorials exist

**Tasks:**

1. \[ ] **Remove welcome screen rendering from Navigation.tsx**
   * Files: `Navigation.tsx`
   * Acceptance: WelcomeMyTutorials is never rendered
   * Details:
     * Update logic: When `children?.length === 0` and section is open, show UploadTutorialForm directly (no welcome screen, no toggle needed)
     * When `children?.length > 0`, show tutorials list and keep + button functionality
     * Keep `isCreateOpen` state for toggling form when tutorials exist
     * Remove conditional rendering of WelcomeMyTutorials (lines 184-189)
     * Keep `onCreate={() => setIsCreateOpen((v) => !v)}` from Group (line 172) - still needed when tutorials exist

2. \[ ] **Fix + button alignment in Group.tsx**
   * Files: `Group.tsx`, `Group/styles.scss`
   * Acceptance: + button is aligned with chevron icon
   * Details:
     * Keep + button rendering (lines 89-109)
     * Keep `handleCreate` function and `onCreate` prop (needed when tutorials exist)
     * Remove OnboardingTour wrapper from + button (will move to file picker)
     * Fix alignment: Ensure + button icon aligns with accordion chevron
     * May need to adjust icon size or container alignment in styles

3. \[ ] **Remove WelcomeMyTutorials component entirely**
   * Files: `WelcomeMyTutorials/` directory
   * Acceptance: Component files deleted, no references remain
   * Details:
     * Delete `WelcomeMyTutorials.tsx`
     * Delete `WelcomeMyTutorials.styles.ts` (or `.scss` if exists)
     * Delete `WelcomeMyTutorials.spec.tsx`
     * Delete `index.ts` (barrel export)
     * Remove WelcomeMyTutorials import from Navigation.tsx (line 42)

4. \[ ] **Remove unused imports and styles**
   * Files: `Navigation.tsx`, `Group.tsx`, `Group/styles.scss`
   * Acceptance: No unused imports, clean code
   * Details:
     * Remove `.group-header__create-btn` styles if no longer referenced
     * Clean up any unused code

**Deliverables:**

* Navigation component without welcome screen logic
* Group component with + button properly aligned with chevron
* WelcomeMyTutorials component removed entirely
* Form shows directly when empty, + button works when tutorials exist
* Clean code with no unused imports

**Testing:**

* Visual: Empty state shows form directly (no welcome screen, no + button)
* Visual: When tutorials exist, + button is visible and aligned with chevron
* Functional: Form appears when section is opened and empty
* Functional: + button opens form when tutorials exist
* No console errors or warnings

### Phase 2: Remove Cancel Button and Update Form

**Goal:** Remove Cancel button from UploadTutorialForm and simplify form footer

**Tasks:**

1. \[ ] **Remove Cancel button from UploadTutorialForm**
   * Files: `UploadTutorialForm.tsx`
   * Acceptance: Cancel button is not rendered
   * Details:
     * Remove Cancel button JSX (lines 107-113)
     * Remove `onCancel` prop from Props interface (line 28)
     * Remove `onCancel` from destructuring (line 32)
     * Remove `onCancel?.()` call

2. \[ ] **Update form footer layout**
   * Files: `UploadTutorialForm.tsx`, `UploadTutorialForm/styles.module.scss`
   * Acceptance: Footer shows only Submit button and CreateTutorialLink
   * Details:
     * Update `.footerButtons` to only contain Submit button
     * Remove `.btnSubmit` margin-left from styles (line 31)
     * Simplify footer layout (may not need `.footerButtons` wrapper anymore)

3. \[ ] **Update Navigation.tsx to remove onCancel prop**
   * Files: `Navigation.tsx`
   * Acceptance: No onCancel prop passed to UploadTutorialForm
   * Details:
     * Remove `onCancel={() => setIsCreateOpen(false)}` from UploadTutorialForm (line 195)
     * This prop is no longer needed since there's no cancel action

**Deliverables:**

* UploadTutorialForm without Cancel button
* Simplified footer layout
* Clean prop interfaces

**Testing:**

* Visual: Only Submit button visible in footer
* Functional: Form submission still works
* No console errors

### Phase 3: Fix Button Icons Alignment

**Goal:** Ensure + button and delete icon are vertically aligned with accordion chevron icon

**Tasks:**

1. \[ ] **Review current alignment**
   * Files: `Group/styles.scss`, `DeleteTutorialButton.tsx`
   * Acceptance: Understanding of current alignment issue
   * Details:
     * Check `.group-header__btn` alignment (lines 28-42)
     * Check `.group-header__delete-btn` icon sizing (lines 44-54)
     * Verify RiIcon size prop in DeleteTutorialButton (line 41: `size="m"`)
     * Check accordion chevron icon size for comparison

2. \[ ] **Fix delete icon alignment**
   * Files: `Group/styles.scss`, `DeleteTutorialButton.tsx`
   * Acceptance: Delete icon aligns with chevron icon
   * Details:
     * Ensure consistent icon sizes between delete icon and chevron
     * Verify container alignment (`.group-header__btn` should align with chevron container)
     * May need to adjust icon size prop or CSS
     * Test with multiple tutorials to ensure all delete buttons align

3. \[ ] **Test visual alignment**
   * Files: Manual testing
   * Acceptance: Visual inspection confirms alignment
   * Details:
     * Open custom tutorials section with tutorials
     * Verify delete icon aligns with chevron on same baseline
     * Test with multiple tutorials

**Deliverables:**

* * button properly aligned with chevron
* Delete icon properly aligned with chevron
* Consistent icon sizing across all header buttons
* Updated styles if needed

**Testing:**

* Visual: + button aligns with chevron when tutorials exist
* Visual: All delete icons align with their respective chevrons
* Functional: + button and delete functionality still work
* Multiple tutorials: All alignments correct

### Phase 4: Update Onboarding to Target File Picker

**Goal:** Move onboarding tour from + button to file picker

**Tasks:**

1. \[ ] **Move OnboardingTour to UploadTutorialForm**
   * Files: `UploadTutorialForm.tsx`
   * Acceptance: OnboardingTour wraps file picker
   * Details:
     * Import OnboardingTour and ONBOARDING\_FEATURES (already imported in Group.tsx)
     * Wrap RiFilePicker with OnboardingTour component
     * Use same config: `ONBOARDING_FEATURES.EXPLORE_CUSTOM_TUTORIALS`
     * Adjust `anchorPosition` if needed (currently "downLeft" in Group, may need different for file picker)
     * Remove `anchorWrapperClassName` or adjust for file picker
     * Keep `panelClassName` logic if needed for page opened state

2. \[ ] **Test onboarding flow**
   * Files: Manual testing
   * Acceptance: Onboarding targets file picker correctly
   * Details:
     * Start onboarding flow
     * Verify tour highlights file picker
     * Verify tour content is correct
     * Verify tour completes successfully

3. \[ ] **Update onboarding anchor position if needed**
   * Files: `UploadTutorialForm.tsx`
   * Acceptance: Onboarding popover appears in correct position
   * Details:
     * Test different `anchorPosition` values if needed
     * Ensure popover doesn't overlap important UI
     * Verify in both empty and non-empty states

**Deliverables:**

* OnboardingTour wrapping file picker
* Onboarding flow working correctly
* Proper anchor positioning

**Testing:**

* Onboarding: Tour targets file picker
* Visual: Popover appears in correct position
* Functional: Onboarding completes successfully

### Phase 5: Update Tests and Clean Up

**Goal:** Update all tests and ensure code quality

**Tasks:**

1. \[ ] **Update Navigation tests**
   * Files: `Navigation.spec.tsx` (if exists), `EnablementArea.spec.tsx`
   * Acceptance: All tests pass
   * Details:
     * Remove tests that check for WelcomeMyTutorials rendering
     * Update tests to check for UploadTutorialForm in empty state
     * Remove tests for + button click
     * Update tests for form submission

2. \[ ] **Update Group tests**
   * Files: `Group.spec.tsx` (if exists)
   * Acceptance: All tests pass
   * Details:
     * Remove tests for + button rendering
     * Remove tests for `handleCreate` function
     * Update tests for delete button alignment if needed

3. \[ ] **Update UploadTutorialForm tests**
   * Files: `UploadTutorialForm.spec.tsx`
   * Acceptance: All tests pass
   * Details:
     * Remove tests for Cancel button
     * Update tests for form submission (no cancel action)
     * Add tests for onboarding tour if needed

4. \[ ] **Remove WelcomeMyTutorials test references**
   * Files: `EnablementArea.spec.tsx` and other test files
   * Acceptance: No test references to WelcomeMyTutorials
   * Details:
     * Remove tests that check for `welcome-my-tutorials` testid
     * Update tests that reference WelcomeMyTutorials component
     * Ensure no broken test imports

5. \[ ] **Run linter and fix any issues**
   * Files: All modified files
   * Acceptance: `yarn lint` passes without errors
   * Details:
     * Follow project code quality standards
     * Remove unused imports
     * Fix any TypeScript errors
     * Ensure proper formatting

**Deliverables:**

* All tests passing
* Code passes linting
* No unused code or imports

**Testing:**

* Unit tests: All component tests pass
* Integration: Onboarding flow works
* Linting: No lint errors
* TypeScript: No type errors

***

## 4. Testing Strategy

### Test Scenarios (from Acceptance Criteria)

**AC1: Remove welcome tutorial screen**

* Test Scenario:
  * Given: User opens tutorials panel and navigates to "My Tutorials" section
  * When: Section is empty and opened
  * Then: UploadTutorialForm is shown directly (no WelcomeMyTutorials component)
* Test Type: Unit/Integration
* Test Location: `Navigation.spec.tsx` or `EnablementArea.spec.tsx`

**AC2: Remove all logic behind welcome tutorial screen**

* Test Scenario:
  * Given: User opens "My Tutorials" section
  * When: Section is empty
  * Then: No `isCreateOpen` state is used, form shows directly
* Test Type: Unit
* Test Location: `Navigation.spec.tsx`

**AC3: + icon aligned with chevron**

* Test Scenario:
  * Given: User opens "My Tutorials" section with tutorials loaded
  * When: Viewing the section header
  * Then: The + button is visible and vertically aligned with the chevron icon
* Test Type: Unit/Visual
* Test Location: `Group.spec.tsx`

**AC4: Delete icon aligned with accordion chevron**

* Test Scenario:
  * Given: User has custom tutorials uploaded
  * When: User views a custom tutorial item with delete button
  * Then: The delete icon button is vertically aligned with the chevron icon
* Test Type: Visual/Manual
* Test Location: Manual visual inspection

**AC5: Cancel button removed**

* Test Scenario:
  * Given: User opens upload form (empty state)
  * When: User views the form footer
  * Then: Only Submit button is visible (no Cancel button)
* Test Type: Unit/Visual
* Test Location: `UploadTutorialForm.spec.tsx`

**AC6: Onboarding updated to show around file picker**

* Test Scenario:
  * Given: User starts onboarding flow
  * When: User reaches custom tutorials step
  * Then: Onboarding tour highlights the file picker (not + button)
* Test Type: Integration/Manual
* Test Location: Manual testing of onboarding flow

### Edge Cases and Error Scenarios

1. **Section closed then reopened**
   * Scenario: User closes "My Tutorials" section, then reopens it when empty
   * Expected Behavior: Form shows directly (no welcome screen)
   * Test: Close and reopen section, verify form appears

2. **Upload tutorial then delete all**
   * Scenario: User uploads a tutorial, then deletes all tutorials
   * Expected Behavior: Form appears again when section becomes empty
   * Test: Upload tutorial, delete it, verify form shows

3. **Onboarding active during form display**
   * Scenario: User is in onboarding flow when viewing empty custom tutorials
   * Expected Behavior: Onboarding tour highlights file picker, form is visible
   * Test: Complete onboarding with empty state

4. **Multiple custom tutorials with delete buttons**
   * Scenario: User has multiple custom tutorials with multiple delete buttons
   * Expected Behavior: All delete buttons align with their respective chevrons
   * Test: Upload multiple tutorials, verify all alignments

5. **Form validation errors**
   * Scenario: User tries to submit form without file or link
   * Expected Behavior: Submit button disabled, form still visible (no cancel needed)
   * Test: Try to submit empty form, verify UI state

6. **Section with tutorials (non-empty state)**
   * Scenario: User has tutorials, opens section
   * Expected Behavior: Tutorials list shows, + button visible and aligned, delete buttons align
   * Test: Open section with tutorials, verify + button works and all buttons align

7. **+ button opens form when tutorials exist**
   * Scenario: User has tutorials, clicks + button
   * Expected Behavior: Form opens, can upload new tutorial
   * Test: Click + button, verify form appears, upload works

### Test Data Needs

* Test tutorial zip file: Use `tutorial.zip` from JIRA ticket attachment
* Multiple custom tutorials: Create 2-3 test tutorials for alignment verification
* Empty state: Clear custom tutorials to test form display

***

## 5. Risk Assessment and Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| State management changes break other logic | Medium | Medium | Carefully review Navigation.tsx for all `isCreateOpen` usages, ensure no other dependencies |
| Delete icon alignment requires CSS that affects other accordions | Low | Medium | Use specific selectors (`.group-header__delete-btn`), test with multiple accordion items |
| Onboarding anchor position incorrect for file picker | Medium | Low | Test different `anchorPosition` values, adjust as needed |
| Removing welcome screen breaks existing tests | High | Low | Update all tests that reference `welcome-my-tutorials` testid |
| Form always visible might cause UX issues | Low | Medium | Verify with design that always-visible form is correct behavior |

### Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Onboarding tour breaks with new anchor | Medium | Medium | Test onboarding flow thoroughly, verify tour completes successfully |
| Telemetry events affected by removing + button | Low | Low | Check if + button click telemetry needs to be moved or removed |
| Other components depend on WelcomeMyTutorials | Low | Low | Component can remain in codebase, just unused |
| Form submission flow breaks without cancel | Low | Medium | Test form submission thoroughly, ensure error handling works |

### Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Test updates take longer than expected | Medium | Low | Allocate buffer time for test updates |
| Design clarification needed for exact behavior | Low | Low | Current description is clear, proceed with implementation |
| Onboarding configuration needs updates | Low | Medium | Test onboarding early, adjust configuration if needed |

### Knowledge Gaps

* **Exact onboarding anchor position**: May need to test different positions for file picker. Start with "downLeft" and adjust if needed.
* **Behavior when section is closed/reopened**: Verify form appears correctly when section is reopened. Should be straightforward based on current logic.
* **Telemetry for + button**: Check if telemetry event `EXPLORE_PANEL_IMPORT_CLICKED` needs to be moved or if it's no longer needed.

***

## 6. Implementation Notes

### Code Quality Standards

* Follow project rules for styled-components migration (prefer layout components over div)
* Use theme spacing values instead of magic numbers
* Use semantic colors from theme
* Ensure all changes pass `yarn lint`
* No console.log statements
* Proper TypeScript types (no `any`)
* Remove unused imports and code

### PR Strategy

This can be implemented as a **single PR** since:

* Changes are related to the same bug fix (custom tutorials UX improvement)
* All changes are in the same area (enablement area components)
* Risk is manageable with thorough testing
* Easier to review as one cohesive change

**Branch:** `fe/bugfix/RI-7767/custom-tutorials-buttons-alignment`

**PR Title:** `RI-7767 Remove welcome screen and fix custom tutorials alignment`

**PR Description:**

```markdown
# What

Simplify custom tutorials UX by removing welcome screen and fixing button alignments:
- Remove WelcomeMyTutorials component usage
- Always show UploadTutorialForm when section is empty (no welcome screen, no + button)
- Keep + button when tutorials exist (aligned with chevron)
- Fix + button and delete icon alignment with accordion chevron
- Remove Cancel button from UploadTutorialForm
- Move onboarding tour to target file picker instead of + button

# Testing

1. Open tutorials panel → My Tutorials section (empty)
2. Verify form shows directly (no welcome screen, no + button)
3. Upload a tutorial, verify + button appears and aligns with chevron
4. Verify delete button aligns with chevron
5. Click + button when tutorials exist, verify form opens
6. Delete all tutorials, verify form appears again (no + button)
7. Complete onboarding flow, verify it targets file picker
8. Test form submission (no cancel button)

---

Closes #RI-7767
```

### Files to Modify

1. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/Navigation/Navigation.tsx`
2. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/Group/Group.tsx`
3. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/Group/styles.scss`
4. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/UploadTutorialForm/UploadTutorialForm.tsx`
5. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/UploadTutorialForm/styles.module.scss`
6. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/UploadTutorialForm/UploadTutorialForm.spec.tsx`
7. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/EnablementArea.spec.tsx` (if tests need updates)

### Files to Delete

1. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/WelcomeMyTutorials/WelcomeMyTutorials.tsx`
2. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/WelcomeMyTutorials/WelcomeMyTutorials.styles.ts` (or `.scss` if exists)
3. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/WelcomeMyTutorials/WelcomeMyTutorials.spec.tsx`
4. `redisinsight/ui/src/components/side-panels/panels/enablement-area/EnablementArea/components/WelcomeMyTutorials/index.ts`

### Dependencies

* No new dependencies required
* Uses existing components (OnboardingTour, RiFilePicker, etc.)
* Uses existing onboarding configuration (`ONBOARDING_FEATURES.EXPLORE_CUSTOM_TUTORIALS`)

***

## 7. Success Criteria

The implementation is successful when:

1. ✅ Welcome screen is never shown (UploadTutorialForm shows directly when empty)
2. ✅ + button is aligned with accordion chevron icon (visible when tutorials exist)
3. ✅ Cancel button is removed from UploadTutorialForm
4. ✅ Delete icon is vertically aligned with accordion chevron icon
5. ✅ Onboarding tour targets file picker and completes successfully
6. ✅ All existing tests pass (with updates)
7. ✅ Code passes linting
8. ✅ Visual inspection confirms alignment matches design specifications
9. ✅ Form submission and tutorial upload continue to work
10. ✅ + button opens form when tutorials exist
11. ✅ No console errors or warnings

***

## 8. Follow-up Actions

After implementation:

1. **Visual QA**: Have designer or QA verify alignment matches design images
2. **Onboarding verification**: Test complete onboarding flow end-to-end
3. **Telemetry check**: Verify telemetry events are still tracked correctly (if + button telemetry needs adjustment)
4. **Documentation**: Update any relevant documentation if behavior changes significantly
5. **Component removal**: WelcomeMyTutorials component has been removed entirely
