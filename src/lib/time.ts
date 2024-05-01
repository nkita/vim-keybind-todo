export const now2unix = () => Math.floor(Date.now() / 1000);
export const unix2date = (unix: number | undefined) => unix === undefined ? "" : new Date(unix * 1000)
export const yyyymmdd = (date: Date | string) => typeof date === "string" ? date : date.toLocaleDateString('sv-SE').replaceAll("-", "/")
export const yyyymmddhhmmss = (date: Date | string) => typeof date === "string" ? date : new Intl.DateTimeFormat(
    'ja-JP',
    {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }
).format(date)


export function getTimeAgo(createDate: Date): string {
    const now: Date = new Date();
    const diffMillis: number = now.getTime() - createDate.getTime();

    // ミリ秒から分、時間、日、月、年に変換
    const minuteMillis: number = 60 * 1000;
    const hourMillis: number = 60 * minuteMillis;
    const dayMillis: number = 24 * hourMillis;
    const monthMillis: number = 30 * dayMillis; // 単純な月の計算（実際のカレンダーとは異なることに注意）
    const yearMillis: number = 365 * dayMillis; // 単純な年の計算

    if (diffMillis < minuteMillis) {
        const diffSeconds: number = Math.round(diffMillis / 1000);
        return `${diffSeconds}秒前`;
    } else if (diffMillis < hourMillis) {
        const diffMinutes: number = Math.round(diffMillis / minuteMillis);
        return `${diffMinutes}分前`;
    } else if (diffMillis < dayMillis) {
        const diffHours: number = Math.round(diffMillis / hourMillis);
        return `${diffHours}時間前`;
    } else if (diffMillis < monthMillis) {
        const diffDays: number = Math.round(diffMillis / dayMillis);
        return `${diffDays}日前`;
    } else if (diffMillis < yearMillis) {
        const diffMonths: number = Math.round(diffMillis / monthMillis);
        return `${diffMonths}ヶ月前`;
    } else {
        const diffYears: number = Math.round(diffMillis / yearMillis);
        return `${diffYears}年前`;
    }
}
