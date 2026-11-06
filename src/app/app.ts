import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'block min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-50',
  },
})
export class App {}
