export const ToastSelectors = {
    // Deprecated - use new toast selectors below
    // TODO: Remove deprecated selectors and usages after migrating all toasts
    toastHeader: '[data-test-subj=euiToastHeader]',
    toastBody: '[class*=euiToastBody]',
    toastSuccess: '[class*=euiToast--success]',
    toastError: '[class*=euiToast--danger]',
    toastCloseButton: '[data-test-subj=toastCloseButton]',
    toastSubmitBtn: 'submit-tooltip-btn',
    toastCancelBtn: 'toast-cancel-btn',

    // New selectors - use these for new toasts
    toastContainer: '[data-testid="redisui-toast"]',
    toastMessage: '[data-testid="redisui-toast-message"]',
    toastDescription: '[data-testid="redisui-toast-description"]',
    toastActionButton: '[data-testid="redisui-toast-action-button"]',
}
