export const FIVE_MINUTES_IN_MILLIS = 5 * 60 * 1000;

export function diffInMilliseconds(targetDate: Date): number {
	return Math.abs(targetDate.getTime() - Date.now());
}
