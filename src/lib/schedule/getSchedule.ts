import { z } from "zod";

const VALUES = ["morning", "afternoon", "night"] as const;
export const TimeOfDayEnum = z.enum(VALUES);
export type TimeOfDay = z.infer<typeof TimeOfDayEnum>;

export const SubjectSchema = z.object({
	name: z.string(),
	classes: z.array(
		z.object({
			name: z.string(),
			periods: z.array(
				z.object({
					day: z.string(),
					startTime: z.string(),
					endTime: z.string(),
				}),
			),
		}),
	),
});
export type SubjectType = z.infer<typeof SubjectSchema>;
export const ActivitySchema = z.object({
	periods: z.array(
		z.object({
			day: z.string(),
			startTime: z.string(),
			endTime: z.string(),
		}),
	),
});

const EnrolledClassSchema = z.object({
	name: z.string(),
	periods: z.array(
		z.object({
			day: z.string(),
			startTime: z.string(),
			endTime: z.string(),
		}),
	),
});

export const ScheduleSchema = z.object({
	subjects: z.array(SubjectSchema),
	activities: z.array(ActivitySchema),
	enrolledClasses: z.array(EnrolledClassSchema),
	dailyLimit: z.number(),
	preferredTime: TimeOfDayEnum,
	populationSize: z.number(),
	generations: z.number(),
	mutationRate: z.number(),
});
export type ScheduleType = z.infer<typeof ScheduleSchema>;

export class Subject {
	name: string;
	classes: Class[];

	constructor(name: string, classes: Class[]) {
		this.name = name;
		this.classes = classes;
	}

	getName(): string {
		return this.name;
	}
}

export class Class {
	name: string;
	periods: TimePeriod[];

	constructor(name: string, periods: TimePeriod[]) {
		this.name = name;
		this.periods = periods;
	}

	getTotalMinutes(): number {
		return this.periods.reduce(
			(total, period) => total + (period.endMinutes() - period.startMinutes()),
			0,
		);
	}
}

export class TimePeriod {
	day: string;
	startTime: string;
	endTime: string;

	constructor(day: string, startTime: string, endTime: string) {
		this.day = day;
		this.startTime = startTime;
		this.endTime = endTime;
	}

	toString(): string {
		return `${this.day} ${this.startTime}-${this.endTime}`;
	}

	private timeToMinutes(time: string): number {
		const [hours, minutes] = time.split(":").map(Number);
		return hours * 60 + minutes;
	}

	startMinutes(): number {
		return this.timeToMinutes(this.startTime);
	}

	endMinutes(): number {
		return this.timeToMinutes(this.endTime);
	}
}

export class Activity {
	periods: TimePeriod[];

	constructor(periods: TimePeriod[]) {
		this.periods = periods;
	}
}
const TimesOfDay = {
	morning: {
		startHour: 7,
		endHour: 12,
	},
	afternoon: {
		startHour: 12,
		endHour: 18,
	},
	night: {
		startHour: 18,
		endHour: 24,
	},
};

type ScheduleProps = {
	subjects: Subject[];
	activities: Activity[];
	enrolledClasses: Class[];
	dailyLimit: number;
	preferredTime: TimeOfDay;
	populationSize: number;
	generations: number;
	mutationRate: number;
};
type Schedule = {
	subject: string;
	cls: Class;
};
export function generateSchedule({
	activities,
	dailyLimit,
	enrolledClasses,
	generations,
	mutationRate,
	populationSize,
	preferredTime,
	subjects,
}: ScheduleProps): Schedule[] {
	//TODO add max break time between classes
	let population: Schedule[][] = Array.from({ length: populationSize }, () =>
		generateRandomSchedule(subjects),
	);

	for (let generation = 0; generation < generations; generation++) {
		const fitnesses = population.map((schedule) =>
			calculateFitness({
				schedule,
				enrolledClasses,
				activities,
				dailyLimit,
				preferredTime,
			}),
		);
		const maxFitness = Math.max(...fitnesses);
		const bestSchedule = population[fitnesses.indexOf(maxFitness)];
		if (maxFitness > 0) {
			return bestSchedule;
		}
		const parents = selectParents({ population, fitnesses });
		population = parents.map((parent, index) => {
			if (index % 2 === 0 && index + 1 < parents.length) {
				return mutate({
					schedule: crossover(parents[index], parents[index + 1]),
					subjects,
					mutationRate,
				});
			}
			return mutate({ schedule: parent, subjects, mutationRate });
		});
	}

	return population[0];
}

function crossover(parent1: Schedule[], parent2: Schedule[]): Schedule[] {
	const crossoverPoint = Math.floor(Math.random() * parent1.length);
	return [
		...parent1.slice(0, crossoverPoint),
		...parent2.slice(crossoverPoint),
	];
}

function mutate({
	schedule,
	subjects,
	mutationRate,
}: {
	schedule: Schedule[];
	subjects: Subject[];
	mutationRate: number;
}): Schedule[] {
	return schedule.map(({ subject, cls }) => {
		if (Math.random() < mutationRate) {
			const subjectObj = subjects.find((s) => s.getName() === subject);
			if (!subjectObj) {
				throw new Error(`Subject not found: ${subject}`);
			}
			const randomClass =
				subjectObj.classes[
					Math.floor(Math.random() * subjectObj.classes.length)
				];
			return { subject, cls: randomClass };
		}
		return { subject, cls };
	});
}

function selectParents({
	population,
	fitnesses,
}: { population: Schedule[][]; fitnesses: number[] }) {
	const totalFitness = fitnesses.reduce((total, fitness) => total + fitness, 0);
	const selected: Schedule[][] = [];

	for (let i = 0; i < population.length; i++) {
		const random = Math.random() * totalFitness;
		let sum = 0;
		for (let j = 0; j < population.length; j++) {
			sum += fitnesses[j];
			if (sum > random) {
				selected.push(population[j]);
				break;
			}
		}
	}
	return selected;
}

function generateRandomSchedule(subjects: Subject[]): Schedule[] {
	return subjects.map((subject) => {
		const randomClass =
			subject.classes[Math.floor(Math.random() * subject.classes.length)];
		return { subject: subject.getName(), cls: randomClass };
	});
}
function calculateFitness({
	activities,
	dailyLimit,
	enrolledClasses,
	preferredTime,
	schedule,
}: {
	schedule: Schedule[];
	activities: Activity[];
	enrolledClasses: Class[];
	dailyLimit: number;
	preferredTime: TimeOfDay;
}): number {
	const dailyMinutesLimit: { [key: string]: number } = {};
	const fitnessPlus = 20;
	let fitness = 0;

	for (const { cls } of schedule) {
		for (const period of cls.periods) {
			const day = period.day;
			const duration = period.endMinutes() - period.startMinutes();
			dailyMinutesLimit[day] = (dailyMinutesLimit[day] || 0) + duration;
			if (dailyMinutesLimit[day] > dailyLimit) {
				//? Exceeds daily limit
				return 0;
			}
		}

		if (classConflictsWithActivities({ cls, activities })) {
			return 0;
		}

		for (const { cls: otherCls } of schedule) {
			if (cls !== otherCls && classesConflict(cls, otherCls)) {
				return 0;
			}
		}

		for (const enrolledCls of enrolledClasses) {
			for (const { cls } of schedule) {
				if (classesConflict(enrolledCls, cls)) {
					return 0;
				}
			}
		}

		fitness = Object.values(dailyMinutesLimit).reduce(
			(total, minutes) => total + (dailyLimit - minutes),
			0,
		);

		// Add a bonus to the fitness based on the preferred time of day
		for (const { cls } of schedule) {
			for (const period of cls.periods) {
				const startHour = period.startMinutes() / 60;
				if (
					preferredTime === TimeOfDayEnum.Enum.morning &&
					startHour >= TimesOfDay.morning.startHour &&
					startHour < TimesOfDay.morning.endHour
				) {
					fitness += fitnessPlus;
				} else if (
					preferredTime === TimeOfDayEnum.Enum.afternoon &&
					startHour >= TimesOfDay.afternoon.startHour &&
					startHour < TimesOfDay.afternoon.endHour
				) {
					fitness += fitnessPlus;
				} else if (
					preferredTime === TimeOfDayEnum.Enum.night &&
					startHour >= TimesOfDay.night.startHour &&
					startHour < TimesOfDay.night.endHour
				) {
					fitness += fitnessPlus;
				}
			}
		}
	}
	return fitness;
}

function classesConflict(class1: Class, class2: Class): boolean {
	for (const period1 of class1.periods) {
		for (const period2 of class2.periods) {
			if (timePeriodsConflict(period1, period2)) {
				return true;
			}
		}
	}
	return false;
}

function classConflictsWithActivities({
	cls,
	activities,
}: { cls: Class; activities: Activity[] }): boolean {
	for (const activity of activities) {
		for (const activityPeriod of activity.periods) {
			for (const classPeriod of cls.periods) {
				if (timePeriodsConflict(activityPeriod, classPeriod)) {
					return true;
				}
			}
		}
	}
	return false;
}

function timePeriodsConflict(
	period1: TimePeriod,
	period2: TimePeriod,
): boolean {
	if (period1.day !== period2.day) {
		return false;
	}
	return !(
		period1.endMinutes() <= period2.startMinutes() ||
		period1.startMinutes() >= period2.endMinutes()
	);
}
