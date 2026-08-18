/**
 * Time Utility Module - India Standard Time (IST / Asia/Kolkata)
 * Guarantees accurate real-time time, date, day and period calculations in Asia/Kolkata timezone.
 */

export interface ISTTimeInfo {
  timestampISO: string;
  timeZone: string;
  time12: string;
  time24: string;
  hours: number;
  minutes: number;
  seconds: number;
  periodAmPm: string;
  dateEn: string;
  dateHi: string;
  dayEn: string;
  dayHi: string;
  periodHindi: string;
  hindiTimePhrase: string;
  hindiTimeDetailed: string;
  hindiDatePhrase: string;
  englishTimePhrase: string;
  englishTimeDetailed: string;
  englishDatePhrase: string;
  hinglishTimePhrase: string;
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

  // Parse parts to determine exact hour, minute, second, period
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'long'
  }).formatToParts(dateObj);

  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const hour24 = parseInt(partMap.hour || '0', 10);
  const minuteNum = parseInt(partMap.minute || '0', 10);
  const secondNum = parseInt(partMap.second || '0', 10);

  let periodHindi = 'रात';
  if (hour24 >= 4 && hour24 < 12) {
    periodHindi = 'सुबह';
  } else if (hour24 >= 12 && hour24 < 16) {
    periodHindi = 'दोपहर';
  } else if (hour24 >= 16 && hour24 < 20) {
    periodHindi = 'शाम';
  }

  const hour12Num = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const periodAmPm = hour24 >= 12 ? 'PM' : 'AM';

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

  // Complete detailed spoken phrases with hours, minutes, and seconds
  const hindiTimePhrase = `अभी ${periodHindi} के ${hour12Num} बज कर ${minuteNum} मिनट और ${secondNum} सेकंड हुए हैं।`;
  const hindiTimeDetailed = `अभी ${hour12Num} घंटे, ${minuteNum} मिनट और ${secondNum} सेकंड हुए हैं (${periodHindi} ${periodAmPm})।`;
  const hinglishTimePhrase = `Abhi ${hour12Num} baj kar ${minuteNum} minute aur ${secondNum} second hue hain (${periodHindi} IST).`;
  const englishTimePhrase = `It is currently ${hour12Num} hours, ${minuteNum} minutes, and ${secondNum} seconds ${periodAmPm} IST (${time12}).`;
  const englishTimeDetailed = `The exact time is ${hour12Num} hours, ${minuteNum} minutes, and ${secondNum} seconds ${periodAmPm} IST.`;
  const hindiDatePhrase = `आज ${dateHi} है।`;
  const englishDatePhrase = `Today is ${dateEn}.`;

  const summaryPrompt = `[CURRENT SYSTEM TIME & DATE - INDIA STANDARD TIME (IST / Asia/Kolkata)]:
- Real-Time Clock: ${time12} (24-Hour: ${time24})
- Exact Breakdown: ${hour12Num} Hours, ${minuteNum} Minutes, ${secondNum} Seconds (${periodAmPm})
- Date: ${dateEn}
- Day of Week: ${dayEn} (${dayHi})
- Spoken Hindi Time Output (Hours, Minutes, Seconds): "${hindiTimePhrase}"
- Spoken Hinglish Time Output: "${hinglishTimePhrase}"
- Spoken English Time Output: "${englishTimePhrase}"
- Spoken Hindi Date Output: "${hindiDatePhrase}"
- Spoken English Date Output: "${englishDatePhrase}"`;

  return {
    timestampISO: dateObj.toISOString(),
    timeZone,
    time12,
    time24,
    hours: hour12Num,
    minutes: minuteNum,
    seconds: secondNum,
    periodAmPm,
    dateEn,
    dateHi,
    dayEn,
    dayHi,
    periodHindi,
    hindiTimePhrase,
    hindiTimeDetailed,
    hindiDatePhrase,
    englishTimePhrase,
    englishTimeDetailed,
    englishDatePhrase,
    hinglishTimePhrase,
    summaryPrompt
  };
}
