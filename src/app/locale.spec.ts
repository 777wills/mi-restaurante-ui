import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';

const NBSP = '\u00a0';

@Component({
  imports: [CurrencyPipe, DecimalPipe, DatePipe],
  template: `
    <p id="price">{{ price | currency: undefined : 'symbol' : '1.0-0' }}</p>
    <p id="zero">{{ 0 | currency: undefined : 'symbol' : '1.0-0' }}</p>
    <p id="number">{{ quantity | number }}</p>
    <p id="date">{{ date | date: 'longDate' }}</p>
  `,
})
class FormatHost {
  readonly price = 25000;
  readonly quantity = 1234.5;
  readonly date = new Date(2026, 10, 5);
}

describe('Formato regional es-CO', () => {
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatHost],
      providers: appConfig.providers,
    }).compileComponents();

    const fixture = TestBed.createComponent(FormatHost);
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
  });

  const text = (id: string) => host.querySelector(`#${id}`)?.textContent?.trim();

  it('formatea el precio en COP sin decimales', () => {
    expect(text('price')).toBe(`$${NBSP}25.000`);
  });

  it('formatea cero en COP', () => {
    expect(text('zero')).toBe(`$${NBSP}0`);
  });

  it('usa coma decimal y punto de miles en los números', () => {
    expect(text('number')).toBe('1.234,5');
  });

  it('muestra la fecha en español con orden día-mes-año', () => {
    expect(text('date')).toBe('5 de noviembre de 2026');
  });
});
