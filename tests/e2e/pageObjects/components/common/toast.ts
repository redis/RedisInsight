import { Selector } from 'testcafe';

export class Toast {
    toastHeader = Selector('[data-testid=redisui-toast-message]', { timeout: 30000 });
    toastBody = Selector('[data-testid=redisui-toast-description]');
    toastSuccess = Selector('[data-testid=redisui-toast]');
    toastError = Selector('[data-testid=toast-error]', { timeout: 30000 });
    toastCloseButton = Selector('[data-testid=redisui-toast-action-button]');
    toastSubmitBtn = Selector('[data-testid=redisui-toast-action-button]');
    // todo: investigate. there is no cancel button in toast
    toastCancelBtn = Selector('[data-testid=redisui-toast-action-button]');
}
