import { Selector } from 'testcafe';

export class ShortcutsPanel {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    shortcutsCloseButton = Selector('[role=dialog][title=Shortcuts] button[title=Close]');
    //TEXT ELEMENTS
    shortcutsTitle = Selector('[role=dialog][title=Shortcuts] [data-role="drawer-heading"]');
    shortcutsDesktopApplicationSection = Selector('[data-test-subj="shortcuts-section-Desktop application"]');
    shortcutsCLISection = Selector('[data-test-subj=shortcuts-section-CLI]');
    shortcutsWorkbenchSection = Selector('[data-test-subj=shortcuts-section-Workbench]');
    //PANELS
    shortcutsPanel = Selector('[data-test-subj=shortcuts-flyout]');

}
