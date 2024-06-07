import type { DayOfWeek } from "@/lib/schedule-generator/types";

export function getPeriodDate(
	day: DayOfWeek,
	startTime: string,
	endTime: string,
): { start: Date; end: Date } {
	function timeToMinutes(time: string): number {
		const [hours, minutes] = time.split(":").map(Number);
		const test = hours * 60 + minutes;
		return test;
	}
	const week: DayOfWeek[] = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const currentDate = new Date();
	const currentDay = currentDate.getDay();
	const targetDay = week.indexOf(day);
	const diff =
		targetDay < currentDay ? -(currentDay - targetDay) : targetDay - currentDay;
	const targetDate = new Date(currentDate);
	targetDate.setDate(currentDate.getDate() + diff);

	const startDate = new Date(targetDate);
	startDate.setHours(timeToMinutes(startTime) / 60);
	startDate.setMinutes(timeToMinutes(startTime) % 60);
	startDate.setSeconds(0);

	const endDate = new Date(targetDate);
	endDate.setHours(timeToMinutes(endTime) / 60);
	endDate.setMinutes(timeToMinutes(endTime) % 60);
	endDate.setSeconds(0);

	return { start: startDate, end: endDate };
}
