import { z } from "zod";

class TimePeriod {
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
const classSchema = z.object({
	name: z.string(),
	periods: z.array(
		z.object({
			day: z.string(),
			startTime: z.string(),
			endTime: z.string(),
		}),
	),
});
class Class {
	name: string;
	periods: TimePeriod[];

	constructor(name: string, periods: TimePeriod[]) {
		this.name = name;
		this.periods = periods;
	}

	toString(): string {
		return `${this.name} ${this.periods
			.map((period) => period.toString())
			.join(", ")}`;
	}

	getTotalMinutes(): number {
		return this.periods.reduce(
			(total, period) => total + (period.endMinutes() - period.startMinutes()),
			0,
		);
	}
}

class Subject {
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

class Activity {
	periods: TimePeriod[];

	constructor(periods: TimePeriod[]) {
		this.periods = periods;
	}
}

enum TimeOfDay {
	Morning = 0,
	Afternoon = 1,
	Night = 2,
}

// Function to check if two time periods conflict
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

// Function to check if two classes conflict
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

// Function to check if a class conflicts with activities
function classConflictsWithActivities(
	cls: Class,
	activities: Activity[],
): boolean {
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

// Genetic Algorithm Functions
function generateRandomSchedule(
	subjects: Subject[],
): { subject: string; cls: Class }[] {
	return subjects.map((subject) => {
		const randomClass =
			subject.classes[Math.floor(Math.random() * subject.classes.length)];
		return { subject: subject.getName(), cls: randomClass };
	});
}

function calculateFitness(
	schedule: { subject: string; cls: Class }[],
	activities: Activity[],
	enrolledClasses: Class[],
	dailyLimit: number,
	preferredTime: TimeOfDay,
): number {
	const dailyMinutes: { [key: string]: number } = {};
	let fitness = 0;
	for (const { cls } of schedule) {
		for (const period of cls.periods) {
			const day = period.day;
			const duration = period.endMinutes() - period.startMinutes();
			dailyMinutes[day] = (dailyMinutes[day] || 0) + duration;
			if (dailyMinutes[day] > dailyLimit) {
				return 0; // Exceeding daily limit makes the schedule invalid
			}
		}
		if (classConflictsWithActivities(cls, activities)) {
			return 0; // Conflicts with activities make the schedule invalid
		}
		for (const { cls: otherCls } of schedule) {
			if (cls !== otherCls && classesConflict(cls, otherCls)) {
				return 0; // Conflicting classes make the schedule invalid
			}
		}
	}
	for (const enrolledCls of enrolledClasses) {
		for (const { cls } of schedule) {
			if (classesConflict(enrolledCls, cls)) {
				return 0; // Conflicting with enrolled classes makes the schedule invalid
			}
		}
	}

	fitness = Object.values(dailyMinutes).reduce(
		(sum, minutes) => sum + (dailyLimit - minutes),
		0,
	);

	// Add a bonus to the fitness based on the preferred time of day
	for (const { cls } of schedule) {
		for (const period of cls.periods) {
			const startHour = period.startMinutes() / 60;
			if (
				preferredTime === TimeOfDay.Morning &&
				startHour >= 7 &&
				startHour < 12
			) {
				fitness += 10;
			} else if (
				preferredTime === TimeOfDay.Afternoon &&
				startHour >= 12 &&
				startHour < 19
			) {
				fitness += 10;
			} else if (
				preferredTime === TimeOfDay.Night &&
				startHour >= 19 &&
				startHour < 23
			) {
				fitness += 10;
			}
		}
	}

	return fitness;
}

function selectParents(
	population: { subject: string; cls: Class }[][],
	fitnesses: number[],
): { subject: string; cls: Class }[][] {
	const totalFitness = fitnesses.reduce((sum, fit) => sum + fit, 0);
	const selected: { subject: string; cls: Class }[][] = [];
	for (let i = 0; i < population.length; i++) {
		const rand = Math.random() * totalFitness;
		let sum = 0;
		for (let j = 0; j < population.length; j++) {
			sum += fitnesses[j];
			if (sum > rand) {
				selected.push(population[j]);
				break;
			}
		}
	}
	return selected;
}

function crossover(
	parent1: { subject: string; cls: Class }[],
	parent2: { subject: string; cls: Class }[],
): { subject: string; cls: Class }[] {
	const crossoverPoint = Math.floor(Math.random() * parent1.length);
	return [
		...parent1.slice(0, crossoverPoint),
		...parent2.slice(crossoverPoint),
	];
}

function mutate(
	schedule: { subject: string; cls: Class }[],
	subjects: Subject[],
	mutationRate: number,
): { subject: string; cls: Class }[] {
	return schedule.map(({ subject, cls }) => {
		if (Math.random() < mutationRate) {
			const subjectObj = subjects.find((s) => s.getName() === subject)!;
			const randomClass =
				subjectObj.classes[
					Math.floor(Math.random() * subjectObj.classes.length)
				];
			return { subject, cls: randomClass };
		}
		return { subject, cls };
	});
}

// Genetic Algorithm Main Function
function geneticAlgorithm(
	subjects: Subject[],
	activities: Activity[],
	enrolledClasses: Class[],
	dailyLimit: number,
	preferredTime: TimeOfDay,
	populationSize: number,
	generations: number,
	mutationRate: number,
): { subject: string; cls: Class }[] {
	let population: { subject: string; cls: Class }[][] = Array.from(
		{ length: populationSize },
		() => generateRandomSchedule(subjects),
	);
	for (let generation = 0; generation < generations; generation++) {
		const fitnesses = population.map((schedule) =>
			calculateFitness(
				schedule,
				activities,
				enrolledClasses,
				dailyLimit,
				preferredTime,
			),
		);
		const maxFitness = Math.max(...fitnesses);
		const bestSchedule = population[fitnesses.indexOf(maxFitness)];
		if (maxFitness > 0) {
			return bestSchedule;
		}
		const parents = selectParents(population, fitnesses);
		population = parents.map((parent, index) => {
			if (index % 2 === 0 && index + 1 < parents.length) {
				return mutate(
					crossover(parents[index], parents[index + 1]),
					subjects,
					mutationRate,
				);
			}
			return mutate(parent, subjects, mutationRate);
		});
	}
	return population[0];
}

export {
	classSchema,
	TimePeriod,
	Class,
	Subject,
	Activity,
	TimeOfDay,
	geneticAlgorithm,
};
