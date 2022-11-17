import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { appWindow } from '@tauri-apps/api/window';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));


const theme = localStorage.getItem('theme');

if (theme != null) {
  changeTheme(theme);
}

setTimeout(() => {
  document.getElementById("themeSwitch")?.addEventListener("click", () => {
    var html = document.querySelector("html")
    if (html?.classList.contains('light')) {
      changeTheme("dark")
      localStorage.setItem('theme', 'dark')
    } else {
      changeTheme("light")
      localStorage.setItem('theme', 'light')
    }
  })
}, 1000);

function changeTheme(theme: string) {
  var html = document.querySelector("html")

  if (theme == 'light') {
    html?.classList.remove("dark");
    html?.classList.add("light");
  } else {
    html?.classList.remove("light");
    html?.classList.add("dark");
  }
}

appWindow.setFocus()


