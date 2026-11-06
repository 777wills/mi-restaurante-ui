import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { readFileSync } from 'node:fs';
import { App } from './app';

describe('App', () => {
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    root = fixture.nativeElement as HTMLElement;
  });

  it('muestra un encabezado con un único h1 «Mi Restaurante»', () => {
    const headings = root.querySelectorAll('header h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Mi Restaurante');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
  });

  it('tiene una región principal con el router-outlet', () => {
    expect(root.querySelector('main router-outlet')).not.toBeNull();
  });

  it('no conserva el contenido de ejemplo del scaffolding', () => {
    expect(root.textContent).not.toContain('Hello');
  });

  it('declara el documento en es-CO con el título «Mi Restaurante»', () => {
    const html = readFileSync('src/index.html', 'utf8');
    expect(html).toContain('lang="es-CO"');
    expect(html).toContain('<title>Mi Restaurante</title>');
  });
});
