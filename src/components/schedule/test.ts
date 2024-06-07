// File path: /src/geneticAlgorithm.ts

import type {
	Class,
	OutputSubject,
	Period,
	Schedule,
	SchedulePenalty,
} from "@/lib/schedule-generator/types";

// Define types
type Chromosome = (OutputSubject & { fitness?: number })[];

class GeneticAlgorithm {
	private scheduleConfig: Schedule;
	private penalties: SchedulePenalty;
	private population: Chromosome[];

	constructor(scheduleConfig: Schedule, penalties: SchedulePenalty) {
		this.scheduleConfig = scheduleConfig;
		this.penalties = penalties;
		this.population = [];
	}

	public run(): OutputSubject[] {
		this.initializePopulation();
		for (
			let generation = 0;
			generation < this.scheduleConfig.generations;
			generation++
		) {
			this.evaluateFitness();
			const newPopulation: Chromosome[] = this.selection();
			this.crossover(newPopulation);
			this.mutate(newPopulation);
			this.population = newPopulation;
		}
		return this.getBestChromosome();
	}

	private initializePopulation(): void {
		this.population = Array.from(
			{ length: this.scheduleConfig.populationSize },
			() => this.createRandomChromosome(),
		);
	}

	private createRandomChromosome(): Chromosome {
		const chromosome: Chromosome = [];
		const addedEvents = new Set<string>();

		// Add fixed events
		this.scheduleConfig.enrolledClasses.forEach((event) =>
			chromosome.push(event),
		);

		// Add random events from available variants ensuring no duplication and respecting timeAvailability and alignment
		this.scheduleConfig.subjects.forEach((event) => {
			if (addedEvents.has(event.title)) return;

			let validVariants = event.classes.filter((variant) =>
				this.isVariantWithinAvailability(variant.periods),
			);

			if (this.scheduleConfig.alignment === "start") {
				validVariants = validVariants.sort((a, b) =>
					this.compareStartTimes(a, b),
				);
			} else if (this.scheduleConfig.alignment === "end") {
				validVariants = validVariants.sort((a, b) =>
					this.compareEndTimes(b, a),
				);
			}

			if (validVariants.length > 0) {
				const chosenVariant = validVariants[0];
				chromosome.push({ ...event, class: chosenVariant });
				addedEvents.add(event.title);
			}
		});

		return chromosome;
	}

	private isVariantWithinAvailability(periods: Period[]): boolean {
		if (Array.isArray(this.scheduleConfig.timeAvailability)) {
			const timeAvailability = this.scheduleConfig.timeAvailability;
			return periods.every((period) =>
				timeAvailability.some(
					(availability) =>
						period.startTime >=
							availability.dayScheduleStart.toISOString().split("T")[1] &&
						period.endTime <=
							availability.dayScheduleEnd.toISOString().split("T")[1],
				),
			);
		}
		const availability = this.scheduleConfig.timeAvailability as {
			startTime: string;
			endTime: string;
		};
		return periods.every(
			(period) =>
				period.startTime >= availability.startTime &&
				period.endTime <= availability.endTime,
		);
	}

	private compareStartTimes(a: Class, b: Class): number {
		const timeA = a.periods.map((p) => p.startTime).sort()[0];
		const timeB = b.periods.map((p) => p.startTime).sort()[0];
		return timeA.localeCompare(timeB);
	}

	private compareEndTimes(a: Class, b: Class): number {
		const timeA = a.periods
			.map((p) => p.endTime)
			.sort()
			.reverse()[0];
		const timeB = b.periods
			.map((p) => p.endTime)
			.sort()
			.reverse()[0];
		return timeA.localeCompare(timeB);
	}

	private evaluateFitness(): void {
		this.population.forEach((chromosome) => {
			let fitness = 0;

			// Check for conflicts and apply penalties
			for (let i = 0; i < chromosome.length; i++) {
				const event1 = chromosome[i];
				for (let j = i + 1; j < chromosome.length; j++) {
					const event2 = chromosome[j];
					if (this.hasConflict(event1, event2)) {
						fitness += this.penalties.constraints;
					}
				}
			}

			// Check for conflicts with fixed events and activities
			chromosome.forEach((event) => {
				if (
					this.hasConflictWithFixedEvents(event) ||
					this.hasConflictWithActivities(event)
				) {
					fitness += this.penalties.constraints;
				}
			});

			// Apply other penalties and adjustments based on the configuration
			fitness += this.applyPenalties(chromosome);

			chromosome["fitness"] = fitness;
		});
	}

	private hasConflict(event1: OutputSubject, event2: OutputSubject): boolean {
		return event1.class.periods.some((p1) =>
			event2.class.periods.some(
				(p2) =>
					p1.day === p2.day &&
					((p1.startTime >= p2.startTime && p1.startTime < p2.endTime) ||
						(p2.startTime >= p1.startTime && p2.startTime < p1.endTime)),
			),
		);
	}

	private hasConflictWithFixedEvents(event: OutputSubject): boolean {
		return this.scheduleConfig.enrolledClasses.some((fixedEvent) =>
			this.hasConflict(event, fixedEvent),
		);
	}

	private hasConflictWithActivities(event: OutputSubject): boolean {
		return this.scheduleConfig.activities.some((activity) =>
			activity.periods.some((period) =>
				event.class.periods.some(
					(ePeriod) =>
						ePeriod.day === period.day &&
						((ePeriod.startTime >= period.startTime &&
							ePeriod.startTime < period.endTime) ||
							(period.startTime >= ePeriod.startTime &&
								period.startTime < ePeriod.endTime)),
				),
			),
		);
	}

	private applyPenalties(chromosome: Chromosome): number {
		const penalty = 0;

		// Apply cultural penalty
		// (Example: If any event is during lunch time, apply penalty)
		// Penalty calculation logic here

		// Apply DNA penalty
		// (Example: If certain events must be close to each other, apply penalty if not met)
		// Penalty calculation logic here

		return penalty;
	}

	private selection(): Chromosome[] {
		const selected: Chromosome[] = [];
		while (selected.length < this.scheduleConfig.populationSize) {
			const tournament = this.getRandomSubset(this.population, 3);
			const winner = tournament.reduce((best, chromosome) =>
				best["fitness"] < chromosome["fitness"] ? best : chromosome,
			);
			selected.push(winner);
		}
		return selected;
	}

	private getRandomSubset(array: Chromosome[], size: number): Chromosome[] {
		const subset: Chromosome[] = [];
		while (subset.length < size) {
			const index = Math.floor(Math.random() * array.length);
			subset.push(array[index]);
		}
		return subset;
	}

	private crossover(population: Chromosome[]): void {
		for (let i = 0; i < population.length; i += 2) {
			if (i + 1 < population.length) {
				const parent1 = population[i];
				const parent2 = population[i + 1];
				const crossoverPoint = Math.floor(Math.random() * parent1.length);
				for (let j = crossoverPoint; j < parent1.length; j++) {
					const temp = parent1[j];
					parent1[j] = parent2[j];
					parent2[j] = temp;
				}
			}
		}
	}

	private mutate(population: Chromosome[]): void {
		population.forEach((chromosome) => {
			if (Math.random() < this.scheduleConfig.mutationRate) {
				const index = Math.floor(Math.random() * chromosome.length);
				const event =
					this.scheduleConfig.subjects[
						Math.floor(Math.random() * this.scheduleConfig.subjects.length)
					];
				const variant =
					event.classes[Math.floor(Math.random() * event.classes.length)];
				chromosome[index] = { ...event, class: variant };
			}
		});
	}

	private getBestChromosome(): OutputSubject[] {
		return this.population.reduce((best, chromosome) =>
			best["fitness"] < chromosome["fitness"] ? best : chromosome,
		);
	}
}

export { GeneticAlgorithm };
