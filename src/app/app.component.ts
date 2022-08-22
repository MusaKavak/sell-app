import { Component } from '@angular/core';
import { app } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Sell-App';

  currentZoom = 100;

  activateLink(id: number) {
    const elements = document.querySelectorAll(".route");
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    elements[id].classList.add('active');

    const activeTabElement = document.getElementById("activeTab");

    const calc = 15 + (180 * id);

    activeTabElement!.style.left = calc.toString() + "px";
  }

  exitProgram() {
    appWindow.close();
  }

  minimiseWindow() {
    appWindow.minimize();
  }
}
