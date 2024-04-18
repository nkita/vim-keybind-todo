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