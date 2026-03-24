import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  visible = false;
  title = '';
  message = '';
  confirmText = 'Aceptar';
  danger = false;
  showCancel = true;

  private resolvePromise: ((value: boolean) => void) | null = null;

  confirm(options: { title: string; message: string; confirmText?: string; danger?: boolean; showCancel?: boolean }): Promise<boolean> {
    this.title = options.title;
    this.message = options.message;
    this.confirmText = options.confirmText || 'Aceptar';
    this.danger = options.danger ?? false;
    this.showCancel = options.showCancel ?? true;
    this.visible = true;

    return new Promise<boolean>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  accept() {
    this.visible = false;
    this.resolvePromise?.(true);
    this.resolvePromise = null;
  }

  cancel() {
    this.visible = false;
    this.resolvePromise?.(false);
    this.resolvePromise = null;
  }
}
