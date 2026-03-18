import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';

interface HistoryEntry {
  from: string; to: string;
  amount: number; result: number; date: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number;
}

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './pages.html',
  styleUrl: './pages.css'
})
export class Pages implements OnInit {

  private API_BASE = 'https://api.deviseci.chalenge14.com/exchange';

  //private API_BASE = '/exchange';
  page = 'converter';
  darkMode = false;

  isLoadingCurrencies = false;
  isLoadingRates = false;
  isLoadingConversion = false;
  dataLoaded = false;
  showShareCopied = false;

  private symbolMap: {[key: string]: string} = {
    XOF: 'CFA', EUR: '€', USD: '$', GBP: '£', NGN: '₦',
    GHS: 'GH₵', MAD: 'MAD', ZAR: 'R', CNY: '¥', JPY: '¥',
    CAD: 'CA$', CHF: 'CHF', TND: 'TND', EGP: 'E£', KES: 'KSh',
    DZD: 'DA', GNF: 'FG', CDF: 'FC', ETB: 'Br',
    TZS: 'TSh', UGX: 'USh', RWF: 'FRw', AED: 'AED', SAR: 'SAR',
    INR: '₹', BRL: 'R$', MXN: '$', AUD: 'A$', SGD: 'S$',
  };

  flagColors: {[key: string]: string[]} = {
    CI: ['#FF8C00', '#FFF', '#009E49'], EU: ['#003399', '#FFCC00', '#003399'],
    US: ['#B22234', '#FFF', '#3C3B6E'], GB: ['#00247D', '#CF142B', '#FFF'],
    NG: ['#008751', '#FFF', '#008751'], GH: ['#006B3F', '#FCD116', '#CE1126'],
    MA: ['#C1272D', '#006233', '#C1272D'], ZA: ['#007749', '#FFB81C', '#DE3831'],
    CN: ['#DE2910', '#FFDE00', '#DE2910'], JP: ['#FFF', '#BC002D', '#FFF'],
    CA: ['#FF0000', '#FFF', '#FF0000'], CH: ['#FF0000', '#FFF', '#FF0000'],
    TN: ['#E70013', '#FFF', '#E70013'], EG: ['#CE1126', '#FFF', '#000'],
    KE: ['#006600', '#CC0001', '#000'], DZ: ['#006233', '#FFF', '#D21034'],
    GN: ['#CE1126', '#FFF', '#009460'], CD: ['#007FFF', '#F7D618', '#CE1126'],
    ET: ['#078930', '#FCDD09', '#DA121A'], TZ: ['#1EB53A', '#FCD116', '#00A3DD'],
    UG: ['#000', '#FCDC04', '#D90000'], RW: ['#20603D', '#FAD201', '#E5BE01'],
    AE: ['#00732F', '#FFF', '#FF0000'], SA: ['#006C35', '#FFF', '#006C35'],
    IN: ['#FF9933', '#FFF', '#128807'], BR: ['#009C3B', '#FFDF00', '#002776'],
    MX: ['#006847', '#FFF', '#CE1126'], AU: ['#00008B', '#FFF', '#FF0000'],
    SG: ['#EF3340', '#FFF', '#EF3340'],
  };

  private flagMap: {[key: string]: string} = {
    XOF: 'CI', EUR: 'EU', USD: 'US', GBP: 'GB', NGN: 'NG',
    GHS: 'GH', MAD: 'MA', ZAR: 'ZA', CNY: 'CN', JPY: 'JP',
    CAD: 'CA', CHF: 'CH', TND: 'TN', EGP: 'EG', KES: 'KE',
    DZD: 'DZ', GNF: 'GN', CDF: 'CD', ETB: 'ET', TZS: 'TZ',
    UGX: 'UG', RWF: 'RW', AED: 'AE', SAR: 'SA', INR: 'IN',
    BRL: 'BR', MXN: 'MX', AUD: 'AU', SGD: 'SG',
  };

  currencies: Currency[] = [];

  fromCurrency = 'XOF';
  toCurrency = 'EUR';
  amount = '500000';
  copied = false;

  convertedResult: number | null = null;
  convertedRate: number | null = null;

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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log(' [INIT] ngOnInit démarré');
    console.log(' [INIT] API_BASE:', this.API_BASE);
    this.loadStaticCurrencies();
    console.log(' [INIT] Devises statiques chargées:', this.currencies.length, 'devises');
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.isLoadingCurrencies = true;
    const url = `${this.API_BASE}/currencies`;
    console.log(' [CURRENCIES] Appel API:', url);

    this.http.get<{currencies: {[key: string]: string}}>(url).pipe(
      finalize(() => {
        this.isLoadingCurrencies = false;
        this.dataLoaded = true;
        console.log(' [CURRENCIES] finalize - isLoadingCurrencies=false, dataLoaded=true');
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log(' [CURRENCIES] Réponse API reçue:', data);
        console.log(' [CURRENCIES] Nombre de devises:', Object.keys(data.currencies || {}).length);

        const priorityCodes = [
          'XOF', 'EUR', 'USD', 'GBP', 'NGN', 'GHS', 'MAD',
          'ZAR', 'CNY', 'JPY', 'CAD', 'CHF', 'TND', 'EGP',
          'KES', 'DZD', 'AED', 'SAR', 'INR', 'BRL'
        ];

        const apiCurrencies = priorityCodes
          .filter(code => data.currencies[code])
          .map(code => ({
            code,
            name: data.currencies[code],
            symbol: this.symbolMap[code] || code,
            flag: this.flagMap[code] || 'CI',
            rate: 1
          }));

        console.log(' [CURRENCIES] Devises filtrées:', apiCurrencies.map(c => c.code));

        this.currencies = this.currencies.map(staticCurr => {
          const apiCurr = apiCurrencies.find(c => c.code === staticCurr.code);
          return apiCurr ? { ...staticCurr, name: apiCurr.name } : staticCurr;
        });

        console.log(' [CURRENCIES] currencies mis à jour:', this.currencies.length);
        this.loadRates();
      },
      error: (error) => {
        console.error(' [CURRENCIES] Erreur complète:', error);
        console.error(' [CURRENCIES] Status:', error.status);
        console.error(' [CURRENCIES] StatusText:', error.statusText);
        console.error(' [CURRENCIES] Message:', error.message);
        console.error(' [CURRENCIES] URL appelée:', error.url);
        console.error(' [CURRENCIES] Error detail:', error.error);
        this.dataLoaded = true;
        this.loadRates();
      }
    });
  }

  loadRates(): void {
    this.isLoadingRates = true;

    const symbols = this.currencies
      .filter(c => c.code !== 'XOF')
      .map(c => c.code)
      .join(',');

    const url = `${this.API_BASE}/rates?base=XOF&symbols=${symbols}`;
    console.log(' [RATES] Appel API:', url);
    console.log(' [RATES] Symboles demandés:', symbols);

    this.http.get<{base: string; rates: {[key: string]: number}}>(url).pipe(
      finalize(() => {
        this.isLoadingRates = false;
        console.log(' [RATES] finalize - isLoadingRates=false');
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log(' [RATES] Réponse API reçue:', data);
        console.log(' [RATES] Base:', data.base);
        console.log(' [RATES] Taux:', data.rates);

        this.currencies = this.currencies.map(c => ({
          ...c,
          rate: c.code === 'XOF' ? 1 : (data.rates[c.code] || c.rate)
        }));

        console.log(' [RATES] currencies avec taux:', this.currencies.map(c => `${c.code}=${c.rate}`));
        this.convertViaApi();
      },
      error: (error) => {
        console.error(' [RATES] Erreur complète:', error);
        console.error(' [RATES] Status:', error.status);
        console.error(' [RATES] StatusText:', error.statusText);
        console.error(' [RATES] Message:', error.message);
        console.error(' [RATES] URL appelée:', error.url);
        console.error(' [RATES] Error detail:', error.error);
        this.convertViaApi();
      }
    });
  }

  convertViaApi(): void {
    console.log(' [CONVERT] Début conversion');
    console.log(' [CONVERT] currencies.length:', this.currencies.length);
    console.log(' [CONVERT] fromCurrency:', this.fromCurrency, '| toCurrency:', this.toCurrency);
    console.log(' [CONVERT] fromC:', this.fromC);
    console.log(' [CONVERT] toC:', this.toC);

    if (!this.currencies.length) {
      console.warn(' [CONVERT] Abandon - currencies vide');
      return;
    }
    if (!this.fromC || !this.toC) {
      console.warn(' [CONVERT] Abandon - fromC ou toC manquant');
      return;
    }

    this.isLoadingConversion = true;
    const amt = parseFloat(this.amount || '0');
    const url = `${this.API_BASE}/convert?from=${this.fromCurrency}&to=${this.toCurrency}&amount=${amt}`;
    console.log(' [CONVERT] Appel API:', url);
    console.log(' [CONVERT] Montant:', amt, '| De:', this.fromCurrency, '| Vers:', this.toCurrency);

    this.http.get<{amount: number; rate: number}>(url).pipe(
      finalize(() => {
        this.isLoadingConversion = false;
        console.log(' [CONVERT] finalize - isLoadingConversion=false');
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log(' [CONVERT] Réponse API reçue:', data);
        console.log(' [CONVERT] Montant converti:', data.amount, '| Taux:', data.rate);
        this.convertedResult = data.amount;
        this.convertedRate = data.rate;
      },
      error: (error) => {
        console.error(' [CONVERT] Erreur complète:', error);
        console.error(' [CONVERT] Status:', error.status);
        console.error(' [CONVERT] StatusText:', error.statusText);
        console.error(' [CONVERT] Message:', error.message);
        console.error(' [CONVERT] URL appelée:', error.url);
        console.error(' [CONVERT] Error detail:', error.error);
        console.log(' [CONVERT] Fallback calcul local:', this.calculatedConversion);
        this.convertedResult = this.calculatedConversion;
        this.convertedRate = this.calculatedRate;
      }
    });
  }

  private loadStaticCurrencies(): void {
    this.currencies = [
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
  }

  get fromC(): Currency {
    return this.currencies.find(c => c.code === this.fromCurrency) || this.currencies[0] || { code: 'XOF', name: '', symbol: '', flag: 'CI', rate: 1 };
  }

  get toC(): Currency {
    return this.currencies.find(c => c.code === this.toCurrency) || this.currencies[1] || { code: 'EUR', name: '', symbol: '', flag: 'EU', rate: 0.00152 };
  }

  get calculatedConversion(): number {
    return parseFloat(this.amount || '0') * (this.toC.rate / this.fromC.rate);
  }

  get calculatedRate(): number {
    return this.toC.rate / this.fromC.rate;
  }

  get converted(): number {
    if (this.convertedResult !== null) return this.convertedResult;
    return this.calculatedConversion;
  }

  get rate(): number {
    if (this.convertedRate !== null) return this.convertedRate;
    return this.calculatedRate;
  }

  get otherCurrencies() {
    return this.currencies.filter(c => c.code !== this.fromCurrency).slice(0, 6);
  }

  get ratesCurrencies() {
    return this.currencies.filter(c => c.code !== 'XOF');
  }

  getFlagColors(code: string): string[] {
    return this.flagColors[code] || ['#FF8C00', '#FFF', '#009E49'];
  }

  getFlagForCode(code: string): string {
    const currency = this.currencies.find(c => c.code === code);
    return currency?.flag || 'CI';
  }

  formatNum(n: number): string {
    if (isNaN(n) || n === undefined || n === null) return '0';
    if (n >= 1) return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }

  sanitizeAmount(val: string): void {
    this.amount = val.replace(/[^0-9.]/g, '');
    this.convertedResult = null;
    this.convertedRate = null;
    this.convertViaApi();
  }

  share(): void {
  const text = `${this.amount} ${this.fromCurrency} = ${this.formatNum(this.converted)} ${this.toCurrency} 💱\nConverti avec DeviseCI — https://deviseci.chalenge14.com`;


  if (navigator.share) {
    navigator.share({
      title: 'DeviseCI — Conversion',
      text: text,
      url: window.location.href
    }).catch(() => {

    });
  } else {
    
    navigator.clipboard?.writeText?.(text);
    this.showShareCopied = true;
    setTimeout(() => this.showShareCopied = false, 2000);
  }
}

  swap(): void {
    const tmp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = tmp;
    this.convertedResult = null;
    this.convertedRate = null;
    this.convertViaApi();
  }

  selectToCurrency(code: string): void {
    this.toCurrency = code;
    this.convertedResult = null;
    this.convertedRate = null;
    this.convertViaApi();
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
    this.convertedResult = null;
    this.convertedRate = null;
    this.page = 'converter';
    this.convertViaApi();
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
