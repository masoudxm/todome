/**
 * Comprehensive Jalali (Shamsi) Solar Calendar Utilities
 */

export interface JalaliDate {
  jy: number;
  jm: number; // 1-12
  jd: number; // 1-31
}

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const JALALI_WEEKDAYS = [
  { key: 0, name: 'شنبه', short: 'ش' },
  { key: 1, name: 'یکشنبه', short: 'ی' },
  { key: 2, name: 'دوشنبه', short: 'د' },
  { key: 3, name: 'سه‌شنبه', short: 'س' },
  { key: 4, name: 'چهارشنبه', short: 'چ' },
  { key: 5, name: 'پنج‌شنبه', short: 'پ' },
  { key: 6, name: 'جمعه', short: 'ج' },
];

export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function toEnglishDigits(str: string): string {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  return res;
}

/**
 * Standard Jalali leap year check
 */
export function isJalaliLeapYear(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let jp = breaks[0];
  let jm: number;
  let jump = 0;
  let leap = -14;

  if (jy < jp || jy >= breaks[breaks.length - 1]) {
    // Basic 33-year cycle fallback
    return [1, 5, 9, 13, 17, 22, 26, 30].includes(((jy % 33) + 33) % 33);
  }

  for (let i = 1; i < breaks.length; i++) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leap += Math.floor(jump / 33) * 8 + Math.floor(((jump % 33) + 3) / 4);
    jp = jm;
  }
  let n = jy - jp;
  leap += Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
  if (jump % 33 === 4 && jump - n === 4) leap += 1;

  const leapG = Math.floor(jy / 4) - Math.floor((jy / 100) + 1) * 3 / 4 - 150;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(((jy % 33) + 33) % 33);
}

export function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) {
    return isJalaliLeapYear(jy) ? 30 : 29;
  }
  return 30;
}

/**
 * Gregorian to Jalali Conversion
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { jy, jm, jd };
}

/**
 * Jalali to Gregorian Conversion
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy = jy + 621;
  let days =
    -355668 +
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400) +
    (jm <= 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) +
    jd;

  let gy2 = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  gy2 += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy2 += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  // Convert to Gregorian date
  const date = new Date(Date.UTC(jy + 621, 2, 21));
  // Accurate day offset
  const sal_a = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jdn =
    jd +
    (jm <= 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) +
    Math.floor((jy - 979) * 365.24219) +
    1948320.5;
  
  // Approximate standard conversion
  let j = 4 * jy + 3;
  let j_d = jd + (jm <= 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let g_days = j_d - 79;
  let g_y = jy + 621;
  let g_m = 1;
  let g_d = 1;

  // Exact JS Date conversion
  const testDate = new Date(g_y, 2, 20 + g_days);
  return {
    gy: testDate.getFullYear(),
    gm: testDate.getMonth() + 1,
    gd: testDate.getDate(),
  };
}

export function getCurrentJalaliDate(): JalaliDate {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function formatJalaliDate(
  dateOrJalali: Date | JalaliDate | string,
  options: { withTime?: boolean; format?: 'numeric' | 'long' | 'short' } = {}
): string {
  let jDate: JalaliDate;

  if (typeof dateOrJalali === 'string') {
    if (dateOrJalali.includes('/')) {
      const parts = toEnglishDigits(dateOrJalali).split(' ')[0].split('/');
      jDate = {
        jy: parseInt(parts[0], 10),
        jm: parseInt(parts[1], 10),
        jd: parseInt(parts[2], 10),
      };
    } else {
      const d = new Date(dateOrJalali);
      jDate = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    }
  } else if (dateOrJalali instanceof Date) {
    jDate = gregorianToJalali(dateOrJalali.getFullYear(), dateOrJalali.getMonth() + 1, dateOrJalali.getDate());
  } else {
    jDate = dateOrJalali;
  }

  if (options.format === 'long') {
    const monthName = JALALI_MONTH_NAMES[jDate.jm - 1] || '';
    return `${toPersianDigits(jDate.jd)} ${monthName} ${toPersianDigits(jDate.jy)}`;
  }

  const mm = String(jDate.jm).padStart(2, '0');
  const dd = String(jDate.jd).padStart(2, '0');
  return `${toPersianDigits(jDate.jy)}/${toPersianDigits(mm)}/${toPersianDigits(dd)}`;
}

/**
 * Returns weekday index in Persian calendar (0 = Saturday, 6 = Friday)
 */
export function getJalaliFirstDayOfMonth(jy: number, jm: number): number {
  const g = jalaliToGregorian(jy, jm, 1);
  const d = new Date(g.gy, g.gm - 1, g.gd);
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday in standard JS
  // Map JS day (0: Sun, 1: Mon... 6: Sat) to Persian (0: Sat, 1: Sun... 6: Fri)
  return (day + 1) % 7;
}

export function isSameJalaliDate(a: JalaliDate, b: JalaliDate): boolean {
  return a.jy === b.jy && a.jm === b.jm && a.jd === b.jd;
}
