import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertifyService {
  private _success = 1;
  private _error = 2;
  private _warning = 3;

  success(message: string) {
    this.showAlert(message, this._success)
  }

  error(message: string) {
    this.showAlert(message, this._error)
  }

  warning(message: string) {
    this.showAlert(message, this._warning)
  }

  private showAlert(message: string, type: number) {
    const alertify = document.getElementById('alertify');
    const alert = document.createElement('div')

    switch (type) {
      case this._success: {
        alert.classList.add('success');
        break;
      }
      case this._error: {
        alert.classList.add('error');
        break
      }
      case this._warning: {
        alert.classList.add('warning');
      }
    }

    alert.textContent = message
    alert.setAttribute('id', 'alert')

    const progressBar = document.createElement('div')
    progressBar.setAttribute('id', 'alert-progressBar')
    alert.appendChild(progressBar);

    alertify?.appendChild(alert);

    setTimeout(() => {
      alert.outerHTML = "";
    }, 5000);
  }
}
