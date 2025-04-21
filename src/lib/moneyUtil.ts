export function calculateNetPayout(salary: number, duration: number) {
	return Math.round(salary * (duration / 60));
}
