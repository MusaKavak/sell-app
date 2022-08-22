import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertifyService {

  constructor() { }

  success = 1;
  error = 2;
  warning = 3;

  showAlert(message: string, type: number) {
    const alertify = document.getElementById('alertify');
    const alert = document.createElement('div')

    switch (type) {
      case this.success: {
        alert.classList.add('success');
        break;
      }
      case this.error: {
        alert.classList.add('error');
        break
      }
      case this.warning: {
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
