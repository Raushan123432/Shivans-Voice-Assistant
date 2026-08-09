/**
 * Time Utility Module - India Standard Time (IST / Asia/Kolkata)
 * Guarantees accurate real-time time, date, day and period calculations in Asia/Kolkata timezone.
 */

export interface ISTTimeInfo {
  timestampISO: string;
  timeZone: string;
  time12: string;
  time24: string;
  dateEn: string;
  dateHi: string;
  dayEn: string;
  dayHi: string;
  periodHindi: string;
  hindiTimePhrase: string;
  hindiDatePhrase: string;
  englishTimePhrase: string;
  englishDatePhrase: string;
  summaryPrompt: string;
}

export function getISTTimeDetails(dateObj: Date = new Date()): ISTTimeInfo {
  const timeZone = 'Asia/Kolkata';

  // 1. Time 12-hour format
  const time12Formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const time12 = time12Formatter.format(dateObj);

  // 2. Time 24-hour format
  const time24Formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const time24 = time24Formatter.format(dateObj);

  // 3. Date English
  const dateEnFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateEn = dateEnFormatter.format(dateObj);

  // 4. Date Hindi
  const dateHiFormatter = new Intl.DateTimeFormat('hi-IN', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateHi = dateHiFormatter.format(dateObj);

  // Parse parts to determine exact hour, minute, period
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'long'
  }).formatToParts(dateObj);

  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const hour24 = parseInt(partMap.hour || '0', 10);
  let periodHindi = 'रात';
  if (hour24 >= 4 && hour24 < 12) {
    periodHindi = 'सुबह';
  } else if (hour24 >= 12 && hour24 < 16) {
    periodHindi = 'दोपहर';
  } else if (hour24 >= 16 && hour24 < 20) {
    periodHindi = 'शाम';
  }

  const hour12Num = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minuteStr = partMap.minute || '00';

  const dayEn = partMap.weekday || 'Today';

  const hindiDayNames: Record<string, string> = {
    Sunday: 'रविवार',
    Monday: 'सोमवार',
    Tuesday: 'मंगलवार',
    Wednesday: 'बुधवार',
    Thursday: 'गुरुवार',
    Friday: 'शुक्रवार',
    Saturday: 'शनिवार'
  };
  const dayHi = hindiDayNames[dayEn] || dayEn;

  const hindiTimePhrase = `अभी ${periodHindi} ${hour12Num}:${minuteStr} बजे हैं।`;
  const hindiDatePhrase = `आज ${dateHi} है।`;
  const englishTimePhrase = `It is currently ${time12} IST.`;
  const englishDatePhrase = `Today is ${dateEn}.`;

  const summaryPrompt = `[CURRENT SYSTEM TIME & DATE - INDIA STANDARD TIME (IST / Asia/Kolkata)]:
- Real-Time Clock: ${time12} (24-Hour: ${time24})
- Date: ${dateEn}
- Day of Week: ${dayEn} (${dayHi})
- Spoken Hindi Time Output: "${hindiTimePhrase}"
- Spoken Hindi Date Output: "${hindiDatePhrase}"
- Spoken English Time Output: "${englishTimePhrase}"
- Spoken English Date Output: "${englishDatePhrase}"`;

  return {
    timestampISO: dateObj.toISOString(),
    timeZone,
    time12,
    time24,
    dateEn,
    dateHi,
    dayEn,
    dayHi,
    periodHindi,
    hindiTimePhrase,
    hindiDatePhrase,
    englishTimePhrase,
    englishDatePhrase,
    summaryPrompt
  };
}
