import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';

interface HistoryEntry {
  from: string; to: string;
  amount: number; result: number; date: string;
}

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './pages.html',
  styleUrl: './pages.css'
})
export class Pages {

  page = 'converter';
  darkMode = false;

  currencies = [
    { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'CFA', flag: 'CI', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: 'EU', rate: 0.00152 },
    { code: 'USD', name: 'Dollar américain', symbol: '$', flag: 'US', rate: 0.00166 },
    { code: 'GBP', name: 'Livre sterling', symbol: '£', flag: 'GB', rate: 0.00131 },
    { code: 'NGN', name: 'Naira nigérian', symbol: '₦', flag: 'NG', rate: 2.63 },
    { code: 'GHS', name: 'Cedi ghanéen', symbol: 'GH₵', flag: 'GH', rate: 0.0249 },
    { code: 'MAD', name: 'Dirham marocain', symbol: 'MAD', flag: 'MA', rate: 0.01625 },
    { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R', flag: 'ZA', rate: 0.0302 },
    { code: 'CNY', name: 'Yuan chinois', symbol: '¥', flag: 'CN', rate: 0.01207 },
    { code: 'JPY', name: 'Yen japonais', symbol: '¥', flag: 'JP', rate: 0.2487 },
    { code: 'CAD', name: 'Dollar canadien', symbol: 'CA$', flag: 'CA', rate: 0.00231 },
    { code: 'CHF', name: 'Franc suisse', symbol: 'CHF', flag: 'CH', rate: 0.00146 },
  ];

  flagColors: {[key: string]: string[]} = {
    CI: ['#FF8C00', '#FFF', '#009E49'], EU: ['#003399', '#FFCC00', '#003399'],
    US: ['#B22234', '#FFF', '#3C3B6E'], GB: ['#00247D', '#CF142B', '#FFF'],
    NG: ['#008751', '#FFF', '#008751'], GH: ['#006B3F', '#FCD116', '#CE1126'],
    MA: ['#C1272D', '#006233', '#C1272D'], ZA: ['#007749', '#FFB81C', '#DE3831'],
    CN: ['#DE2910', '#FFDE00', '#DE2910'], JP: ['#FFF', '#BC002D', '#FFF'],
    CA: ['#FF0000', '#FFF', '#FF0000'], CH: ['#FF0000', '#FFF', '#FF0000'],
  };

  fromCurrency = 'XOF';
  toCurrency = 'EUR';
  amount = '500000';
  copied = false;

  convHistory: HistoryEntry[] = [
    { from: 'XOF', to: 'EUR', amount: 500000, result: 762.20, date: '16/03/2026 14:32' },
    { from: 'USD', to: 'XOF', amount: 150, result: 90361, date: '16/03/2026 12:15' },
    { from: 'XOF', to: 'GBP', amount: 1000000, result: 1310, date: '16/03/2026 10:45' },
    { from: 'EUR', to: 'XOF', amount: 200, result: 131578, date: '15/03/2026 22:10' },
    { from: 'XOF', to: 'NGN', amount: 250000, result: 657500, date: '15/03/2026 18:30' },
  ];

  teamMembers = [
    { name: 'Bath Dorgeles', role: 'Chef de projet & Front-end' },
    { name: 'Oclin Marcel C.', role: 'Dev Front-end' },
    { name: 'Rayane Irie', role: 'Spécialiste Back-end' },
  ];

  stackItems = [
    { tech: 'Angular', type: 'Front-end' },
    { tech: 'Bootstrap', type: 'UI Framework' },
    { tech: 'Python', type: 'Back-end' },
    { tech: 'FastAPI', type: 'API Framework' },
  ];

  miniChartBars = [35,42,38,55,48,62,58,70,65,72,68,75,78,72,80];

  // ——— GETTERS — jamais undefined grâce au ?? ———
  get fromC() {
    return this.currencies.find(c => c.code === this.fromCurrency) ?? this.currencies[0];
  }

  get toC() {
    return this.currencies.find(c => c.code === this.toCurrency) ?? this.currencies[1];
  }

  get converted(): number {
    return parseFloat(this.amount || '0') * (this.toC.rate / this.fromC.rate);
  }

  get rate(): number {
    return this.toC.rate / this.fromC.rate;
  }

  get otherCurrencies() {
    return this.currencies.filter(c => c.code !== this.fromCurrency).slice(0, 6);
  }

  get ratesCurrencies() {
    return this.currencies.filter(c => c.code !== 'XOF');
  }

  // ——— MÉTHODES ———
  getFlagColors(code: string): string[] {
    return this.flagColors[code] || ['#999', '#FFF', '#999'];
  }

  getFlagForCode(code: string): string {
    return this.currencies.find(c => c.code === code)?.flag || 'CI';
  }

  formatNum(n: number): string {
    if (n >= 1) return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }

  sanitizeAmount(val: string): void {
    this.amount = val.replace(/[^0-9.]/g, '');
  }

  swap(): void {
    const tmp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = tmp;
  }

  selectToCurrency(code: string): void {
    this.toCurrency = code;
  }

  saveToHistory(): void {
    const now = new Date().toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    this.convHistory = [
      { from: this.fromCurrency, to: this.toCurrency, amount: parseFloat(this.amount || '0'), result: this.converted, date: now },
      ...this.convHistory
    ].slice(0, 20);
  }

  copyResult(): void {
    navigator.clipboard?.writeText?.(`${this.amount} ${this.fromCurrency} = ${this.formatNum(this.converted)} ${this.toCurrency}`);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  redoConversion(h: HistoryEntry): void {
    this.fromCurrency = h.from;
    this.toCurrency = h.to;
    this.amount = String(h.amount);
    this.page = 'converter';
  }

  getInitials(name: string): string {
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');
  }

  getRandomBars(): number[] {
    return Array.from({length: 8}, () => Math.round(Math.random() * 100));
  }

 
  onPageChange(page: string): void {
    this.page = page;
  }
}

