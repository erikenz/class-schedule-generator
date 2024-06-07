import {
	type Activity,
	type Class,
	type DayOfWeek,
	DayOfWeekEnum,
	type OutputSchedule,
	type OutputSubject,
	type Period,
	type Schedule,
	type SchedulePenalty,
	type Subject,
} from "@/lib/schedule-generator/types";

// Helper functions for time manipulation
const parseTime = (time: string): number => {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
};

const formatTime = (minutes: number): string => {
	const hours = Math.floor(minutes / 60)
		.toString()
		.padStart(2, "0");
	const mins = (minutes % 60).toString().padStart(2, "0");
	return `${hours}:${mins}`;
};

// Helper function to check if two periods overlap
const periodsOverlap = (period1: Period, period2: Period): boolean => {
	if (period1.day !== period2.day) return false;
	const start1 = parseTime(period1.startTime);
	const end1 = parseTime(period1.endTime);
	const start2 = parseTime(period2.startTime);
	const end2 = parseTime(period2.endTime);
	return start1 < end2 && start2 < end1;
};

// Genetic Algorithm
class GeneticAlgorithm {
	private population: Schedule[];
	private readonly config: Schedule;
	private readonly penalties: SchedulePenalty;

	constructor(config: Schedule) {
		this.config = config;
		this.penalties = config.penalties;
		this.population = this.initializePopulation();
	}

	// Initialize the population with random schedules
	private initializePopulation(): Schedule[] {
		const population: Schedule[] = [];
		for (let i = 0; i < this.config.populationSize; i++) {
			const schedule: Schedule = this.createRandomSchedule();
			population.push(schedule);
		}
		return population;
	}

	// Create a random schedule
	private createRandomSchedule(): Schedule {
		const subjects = this.config.subjects.map((subject) => {
			const randomClass =
				subject.classes[Math.floor(Math.random() * subject.classes.length)];
			return {
				...subject,
				classes: [randomClass],
			};
		});

		const activities = [...this.config.activities];
		const enrolledClasses = [...this.config.enrolledClasses];

		return {
			...this.config,
			subjects,
			activities,
			enrolledClasses,
		};
	}

	// Evaluate the fitness of a schedule
	private evaluateFitness(schedule: Schedule): number {
		let fitness = 0;

		// Create a map to track occupied time slots
		const occupiedSlots = new Map<DayOfWeek, (string | null)[]>();
		for (const day of Object.values(DayOfWeekEnum._def.values)) {
			occupiedSlots.set(day, Array(this.config.timeSlots.length).fill(null));
		}

		// Check for overlaps and penalize
		for (const subject of schedule.subjects) {
			for (const classItem of subject.classes) {
				for (const period of classItem.periods) {
					for (const enrolledClass of schedule.enrolledClasses) {
						if (periodsOverlap(period, enrolledClass.class.periods[0])) {
							fitness -= this.penalties.constraints;
						}
					}
					for (const activity of schedule.activities) {
						for (const activityPeriod of activity.periods) {
							if (periodsOverlap(period, activityPeriod)) {
								fitness -= this.penalties.constraints;
							}
						}
					}
					// Mark the time slots as occupied
					const startSlotIndex = this.config.timeSlots.findIndex(
						(slot) => slot.startTime === period.startTime,
					);
					const endSlotIndex = this.config.timeSlots.findIndex(
						(slot) => slot.endTime === period.endTime,
					);
					for (let i = startSlotIndex; i <= endSlotIndex; i++) {
						if (occupiedSlots.get(period.day)[i] !== null) {
							fitness -= this.penalties.constraints;
						} else {
							occupiedSlots.get(period.day)[i] = classItem.id;
						}
					}
				}
			}
		}

		// Check if classes fit within time slots
		for (const subject of schedule.subjects) {
			for (const classItem of subject.classes) {
				for (const period of classItem.periods) {
					let fitsInTimeSlot = false;
					for (const timeSlot of schedule.timeSlots) {
						if (
							parseTime(period.startTime) >= parseTime(timeSlot.startTime) &&
							parseTime(period.endTime) <= parseTime(timeSlot.endTime)
						) {
							fitsInTimeSlot = true;
							break;
						}
					}
					if (!fitsInTimeSlot) {
						fitness -= this.penalties.constraints;
					}
				}
			}
		}

		// Check for daily hour limit
		const hoursPerDay: { [key in DayOfWeek]: number } = {
			Sunday: 0,
			Monday: 0,
			Tuesday: 0,
			Wednesday: 0,
			Thursday: 0,
			Friday: 0,
			Saturday: 0,
		};
		for (const subject of schedule.subjects) {
			for (const classItem of subject.classes) {
				for (const period of classItem.periods) {
					const duration =
						parseTime(period.endTime) - parseTime(period.startTime);
					hoursPerDay[period.day] += duration;
				}
			}
		}
		for (const day in hoursPerDay) {
			if (hoursPerDay[day as DayOfWeek] > this.config.dailyHourLimit * 60) {
				fitness -= this.penalties.dna;
			}
		}

		// Check for alignment
		for (const subject of schedule.subjects) {
			for (const classItem of subject.classes) {
				for (const period of classItem.periods) {
					if (
						this.config.alignment === "start" &&
						parseTime(period.startTime) >
							parseTime(schedule.timeSlots[0].startTime)
					) {
						fitness -= this.penalties.cultural;
					}
					if (
						this.config.alignment === "end" &&
						parseTime(period.endTime) <
							parseTime(
								schedule.timeSlots[schedule.timeSlots.length - 1].endTime,
							)
					) {
						fitness -= this.penalties.cultural;
					}
				}
			}
		}

		return fitness;
	}

	// Select parents using tournament selection
	private tournamentSelection(): Schedule {
		const tournament: Schedule[] = [];
		for (let i = 0; i < this.config.tournamentSize; i++) {
			const randomIndex = Math.floor(Math.random() * this.population.length);
			tournament.push(this.population[randomIndex]);
		}

		// Find the best schedule in the tournament
		let best = tournament[0];
		for (const individual of tournament) {
			if (this.evaluateFitness(individual) > this.evaluateFitness(best)) {
				best = individual;
			}
		}

		return best;
	}

	// Crossover between two parents to produce an offspring
	private crossover(parent1: Schedule, parent2: Schedule): Schedule {
		// Implement crossover logic
		const offspring: Schedule = {
			...this.config,
			subjects: [],
			activities: [...this.config.activities],
			enrolledClasses: [...this.config.enrolledClasses],
		};

		// Combine subjects from both parents
		for (let i = 0; i < parent1.subjects.length; i++) {
			const sourceParent = Math.random() < 0.5 ? parent1 : parent2;
			offspring.subjects.push(sourceParent.subjects[i]);
		}

		return offspring;
	}

	// Mutate a schedule
	private mutate(schedule: Schedule): Schedule {
		// Implement mutation logic
		if (Math.random() < this.config.mutationRate) {
			// Randomly select a subject and replace its class with another class from the same subject
			const subjectIndex = Math.floor(Math.random() * schedule.subjects.length);
			const subject = schedule.subjects[subjectIndex];
			const newClass =
				subject.classes[Math.floor(Math.random() * subject.classes.length)];
			schedule.subjects[subjectIndex] = {
				...subject,
				classes: [newClass],
			};
		}
		return schedule;
	}

	// Run the genetic algorithm
	public run(): OutputSchedule {
		for (
			let generation = 0;
			generation < this.config.generations;
			generation++
		) {
			const newPopulation: Schedule[] = [];

			// Elitism: retain the best individuals
			const elite: Schedule[] = this.population
				.sort((a, b) => this.evaluateFitness(b) - this.evaluateFitness(a))
				.slice(0, this.config.elitismCount);
			newPopulation.push(...elite);

			// Create the rest of the new population
			while (newPopulation.length < this.config.populationSize) {
				const parent1 = this.tournamentSelection();
				const parent2 = this.tournamentSelection();
				let offspring = this.crossover(parent1, parent2);
				offspring = this.mutate(offspring);
				newPopulation.push(offspring);
			}

			this.population = newPopulation;
		}

		// Return the best schedule
		const bestSchedule = this.population.reduce((best, current) => {
			return this.evaluateFitness(current) > this.evaluateFitness(best)
				? current
				: best;
		}, this.population[0]);

		return this.convertToOutputSchedule(bestSchedule);
	}

	// Convert the internal schedule representation to the output format
	private convertToOutputSchedule(schedule: Schedule): OutputSchedule {
		const subjects: OutputSubject[] = schedule.subjects.map((subject) => ({
			...subject,
			class: subject.classes[0], // Example conversion, adjust as needed
		}));

		return {
			subjects,
			enrolledClasses: schedule.enrolledClasses,
			activities: schedule.activities,
		};
	}
}

type Member = OutputSubject[];
type Population = Member[];

// Main genetic algorithm function
function geneticAlgorithm(schedule: Schedule): OutputSchedule[] {
	const {
		populationSize,
		generations,
		mutationRate,
		elitismCount,
		tournamentSize,
		subjects,
		activities,
		enrolledClasses,
		penalties,
	} = schedule;
	const population: Population = initializePopulation(schedule);
	console.log(
		"file: genetic-algorithm.ts:30 > geneticAlgorithm > population:",
		population,
	);

	// for (let generation = 0; generation < generations; generation++) {
	// 	const eliteIndividuals = performElitism(
	// 		population,
	// 		elitismCount,
	// 		penalties,
	// 	);
	// 	const selectedParents = performTournamentSelection(
	// 		population,
	// 		tournamentSize,
	// 		elitismCount,
	// 		penalties,
	// 	);

	// 	const offspring = [];
	// 	for (let i = 0; i < selectedParents.length - 1; i += 2) {
	// 		const parent1 = selectedParents[i];
	// 		const parent2 = selectedParents[i + 1];
	// 		const child = performCrossover(parent1, parent2);
	// 		offspring.push(child);
	// 	}

	// 	const mutatedOffspring = offspring.map((child) =>
	// 		performMutation(child, mutationRate),
	// 	);
	// 	population = replaceLeastFit(
	// 		population,
	// 		mutatedOffspring,
	// 		elitismCount,
	// 		penalties,
	// 	);
	// }

	// const bestIndividual = population.schedules.reduce((best, schedule) => {
	// 	return evaluateFitness(schedule, penalties) >
	// 		evaluateFitness(best, penalties)
	// 		? schedule
	// 		: best;
	// });

	// // Transform best individual into OutputSchedule format
	// const outputSchedule: OutputSchedule = bestIndividual.subjects.map(
	// 	(subject) => ({
	// 		title: subject.title,
	// 		class: subject.classes[0], // Assuming each subject has only one class in the schedule
	// 		category: subject.category,
	// 		color: subject.color,
	// 	}),
	// );

	return [];
}

function initializePopulation({
	populationSize,
	subjects,
	activities,
	enrolledClasses,
	timeSlots,
}: Schedule): Population {
	console.log("file: genetic-algorithm.ts:94 > timeSlots:", timeSlots.length);

	const population: Population = Array.from({ length: populationSize }, () => {
		//TODO make the length equal timeSlots length
		const member = new Set<OutputSubject>();
		subjects.forEach((subject) => {
			const randomClassIndex = Math.floor(
				Math.random() * subject.classes.length,
			);
			const randomClass = subject.classes[randomClassIndex];
			member.add({
				title: subject.title,
				class: randomClass,
				category: subject.category,
				color: subject.color,
			});
		});
		return Array.from(member);
	});

	return population;
}

export { geneticAlgorithm, GeneticAlgorithm };

// // Function to initialize a population of schedules
// function initializePopulation(
// 	populationSize: number,
// 	subjects: Subject[],
// 	activities: Activity[],
// 	enrolledClasses: OutputSchedule,
// ): Population {
// 	const schedules: OutputSchedule[] = [];

// 	// Generate random schedules
// 	for (let i = 0; i < populationSize; i++) {
// 		const schedule: OutputSchedule = generateRandomSchedule(
// 			subjects,
// 			activities,
// 			enrolledClasses,
// 		);
// 		schedules.push(schedule);
// 	}

// 	return { schedules };
// }

// // Function to generate a random schedule
// function generateRandomSchedule(
// 	subjects: Subject[],
// 	activities: Activity[],
// 	enrolledClasses: OutputSchedule,
// ): OutputSchedule[] {
// 	const randomSchedule: OutputSchedule[] = {
// title: "Random Schedule",
// class:{

// }
// 	};

// 	// Add subjects to the schedule
// 	subjects.forEach((subject) => {
// 		const randomClassIndex = Math.floor(Math.random() * subject.classes.length);
// 		const randomClass = subject.classes[randomClassIndex];
// 		randomSchedule.push({
// 			...subject,
// 			classes: [randomClass],
// 		});
// 	});

// 	// Add activities to the schedule
// 	activities.forEach((activity) => {
// 		randomSchedule.activities.push(activity);
// 	});

// 	return randomSchedule;
// }

// // Function to evaluate the fitness of a schedule
// function evaluateFitness(
// 	schedule: Schedule,
// 	penalties: SchedulePenalty,
// ): number {
// 	let fitness = 0;

// 	// Check hard constraints and apply penalties if they are violated
// 	schedule.subjects.forEach((subject) => {
// 		subject.classes.forEach((cls) => {
// 			cls.periods.forEach((period) => {
// 				// Check for overlaps with other classes, activities, and enrolled classes
// 				if (isOverlapping(period, schedule)) {
// 					fitness -= penalties.constraints;
// 				}
// 			});
// 		});
// 	});

// 	// Check if the total class time exceeds the daily hour limit
// 	if (calculateDailyHours(schedule) > schedule.dailyHourLimit) {
// 		fitness -= penalties.constraints;
// 	}

// 	// Apply soft constraints
// 	if (schedule.alignment === "start") {
// 		fitness += calculateAlignmentFitness(schedule, "start");
// 	} else if (schedule.alignment === "end") {
// 		fitness += calculateAlignmentFitness(schedule, "end");
// 	}

// 	return fitness;
// }
// // Function to check if a period overlaps with any other periods in the schedule
// function isOverlapping(period: Period, schedule: Schedule): boolean {
// 	// Check overlap with other classes
// 	for (const subject of schedule.subjects) {
// 		for (const cls of subject.classes) {
// 			for (const otherPeriod of cls.periods) {
// 				if (period !== otherPeriod && periodsOverlap(period, otherPeriod)) {
// 					return true;
// 				}
// 			}
// 		}
// 	}

// 	// Check overlap with activities
// 	for (const activity of schedule.activities) {
// 		for (const activityPeriod of activity.periods) {
// 			if (periodsOverlap(period, activityPeriod)) {
// 				return true;
// 			}
// 		}
// 	}

// 	// Check overlap with enrolled classes
// 	for (const enrolledClass of schedule.enrolledClasses) {
// 		for (const enrolledPeriod of enrolledClass.class.periods) {
// 			if (periodsOverlap(period, enrolledPeriod)) {
// 				return true;
// 			}
// 		}
// 	}

// 	return false;
// }
// // Function to check if two periods overlap
// function periodsOverlap(period1: Period, period2: Period): boolean {
// 	if (period1.day !== period2.day) {
// 		return false;
// 	}

// 	const start1 = parseTime(period1.startTime);
// 	const end1 = parseTime(period1.endTime);
// 	const start2 = parseTime(period2.startTime);
// 	const end2 = parseTime(period2.endTime);

// 	return start1 < end2 && start2 < end1;
// }
// // Function to parse a time string in "HH:mm" format to a Date object
// function parseTime(time: string): Date {
// 	const [hours, minutes] = time.split(":").map(Number);
// 	const date = new Date();
// 	date.setHours(hours, minutes, 0, 0);
// 	return date;
// }
// // Function to calculate the total daily hours of classes in the schedule
// function calculateDailyHours(schedule: Schedule): number {
// 	const dailyHours = new Map<DayOfWeek, number>();

// 	schedule.subjects.forEach((subject) => {
// 		subject.classes.forEach((cls) => {
// 			cls.periods.forEach((period) => {
// 				if (!dailyHours.has(period.day)) {
// 					dailyHours.set(period.day, 0);
// 				}
// 				const hours =
// 					(parseTime(period.endTime).getTime() -
// 						parseTime(period.startTime).getTime()) /
// 					(1000 * 60 * 60);
// 				// biome-ignore lint/style/noNonNullAssertion: <explanation>
// 				dailyHours.set(period.day, dailyHours.get(period.day)! + hours);
// 			});
// 		});
// 	});

// 	let totalDailyHours = 0;
// 	dailyHours.forEach((hours) => {
// 		totalDailyHours += hours;
// 	});

// 	return totalDailyHours;
// }
// // Function to calculate the fitness based on alignment
// function calculateAlignmentFitness(
// 	schedule: Schedule,
// 	alignment: "start" | "end",
// ): number {
// 	let alignmentFitness = 0;
// 	if (!schedule.timeSlots || !schedule.timeSlots[0]) return 0;
// 	const timeSlotStart = parseTime(schedule.timeSlots[0].startTime).getTime();
// 	const timeSlotEnd = parseTime(
// 		schedule.timeSlots[schedule.timeSlots.length - 1].endTime,
// 	).getTime();

// 	const periods: Period[] = [];
// 	schedule.subjects.forEach((subject) => {
// 		subject.classes.forEach((cls) => {
// 			cls.periods.forEach((period) => {
// 				periods.push(period);
// 			});
// 		});
// 	});

// 	// Sort periods by start time
// 	periods.sort(
// 		(a, b) =>
// 			parseTime(a.startTime).getTime() - parseTime(b.startTime).getTime(),
// 	);

// 	if (alignment === "start") {
// 		periods.forEach((period) => {
// 			const periodStart = parseTime(period.startTime).getTime();
// 			const closestStart = Math.min(
// 				periodStart - timeSlotStart,
// 				...periods.map((p) => parseTime(p.startTime).getTime() - timeSlotStart),
// 			);
// 			alignmentFitness += 1 / (closestStart + 1);
// 		});
// 	} else if (alignment === "end") {
// 		periods.forEach((period) => {
// 			const periodEnd = parseTime(period.endTime).getTime();
// 			const closestEnd = Math.min(
// 				timeSlotEnd - periodEnd,
// 				...periods.map((p) => timeSlotEnd - parseTime(p.endTime).getTime()),
// 			);
// 			alignmentFitness += 1 / (closestEnd + 1);
// 		});
// 	}
// 	console.log(schedule, alignmentFitness);
// 	return alignmentFitness;
// }

// // Function to perform elitism selection
// function performElitism(
// 	population: Population,
// 	elitismCount: number,
// 	penalties: SchedulePenalty,
// ): Schedule[] {
// 	// Sort the population by fitness in descending order
// 	const sortedPopulation = population.schedules.sort(
// 		(a, b) => evaluateFitness(b, penalties) - evaluateFitness(a, penalties),
// 	);
// 	// Select the top individuals based on elitism count
// 	return sortedPopulation.slice(0, elitismCount);
// }

// // Function to perform tournament selection
// function performTournamentSelection(
// 	population: Population,
// 	tournamentSize: number,
// 	elitismCount: number,
// 	penalties: SchedulePenalty,
// ): Schedule[] {
// 	const selectedParents: Schedule[] = [];
// 	const remainingParentsCount = population.schedules.length - elitismCount;

// 	// Perform tournaments until we have selected enough parents
// 	while (selectedParents.length < remainingParentsCount) {
// 		// Randomly select individuals for the tournament
// 		const tournamentParticipants = getRandomSubset(
// 			population.schedules,
// 			tournamentSize,
// 		);
// 		// Select the fittest individual from the tournament
// 		const winner = tournamentParticipants.reduce((best, schedule) => {
// 			return evaluateFitness(schedule, penalties) >
// 				evaluateFitness(best, penalties)
// 				? schedule
// 				: best;
// 		});
// 		// Add the winner to the selected parents
// 		selectedParents.push(winner);
// 	}

// 	return selectedParents;
// }

// // Function to perform crossover between parents
// function performCrossover(parent1: Schedule, parent2: Schedule): Schedule {
// 	// Randomly select a crossover point
// 	const crossoverPoint = Math.floor(Math.random() * parent1.subjects.length);

// 	// Create a new schedule by combining genetic information from parents
// 	const childSchedule: Schedule = {
// 		...parent1, // Copy properties from parent1
// 		subjects: [
// 			...parent1.subjects.slice(0, crossoverPoint),
// 			...parent2.subjects.slice(crossoverPoint),
// 		],
// 		activities: [
// 			...parent1.activities.slice(0, crossoverPoint),
// 			...parent2.activities.slice(crossoverPoint),
// 		],
// 		enrolledClasses: [
// 			...parent1.enrolledClasses.slice(0, crossoverPoint),
// 			...parent2.enrolledClasses.slice(crossoverPoint),
// 		],
// 		// Copy other properties as needed
// 	};

// 	return childSchedule;
// }

// // Function to perform mutation on a schedule
// function performMutation(schedule: Schedule, mutationRate: number): Schedule {
// 	// Iterate through each gene in the schedule and apply mutation with probability mutationRate
// 	const mutatedSchedule = { ...schedule }; // Make a copy of the original schedule
// 	for (let i = 0; i < mutatedSchedule.subjects.length; i++) {
// 		if (Math.random() < mutationRate) {
// 			// Apply mutation to the gene (e.g., randomly change the class or activity)
// 			// Implementation of mutation goes here
// 		}
// 	}
// 	return mutatedSchedule;
// }

// // Function to replace least fit individuals in the population with offspring
// function replaceLeastFit(
// 	population: Population,
// 	offspring: Schedule[],
// 	elitismCount: number,
// 	penalties: SchedulePenalty,
// ): Population {
// 	const eliteIndividuals = performElitism(population, elitismCount, penalties);
// 	// Combine elite individuals with offspring
// 	const newPopulation = {
// 		schedules: [...eliteIndividuals, ...offspring],
// 	};

// 	// Sort the combined population by fitness
// 	newPopulation.schedules.sort(
// 		(a, b) => evaluateFitness(b, penalties) - evaluateFitness(a, penalties),
// 	);

// 	// Select the top individuals to form the next generation
// 	return {
// 		schedules: newPopulation.schedules.slice(0, population.schedules.length),
// 	};
// }

// // Function to generate a random subset of individuals from a population
// function getRandomSubset(
// 	population: Schedule[],
// 	subsetSize: number,
// ): Schedule[] {
// 	const shuffled = population.slice();
// 	for (let i = shuffled.length - 1; i > 0; i--) {
// 		const j = Math.floor(Math.random() * (i + 1));
// 		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
// 	}
// 	return shuffled.slice(0, subsetSize);
// }
