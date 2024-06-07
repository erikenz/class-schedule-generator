import { z } from "zod";

export const DayOfWeekEnum = z.enum([
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
]);
export type DayOfWeek = z.infer<typeof DayOfWeekEnum>;

export const PeriodSchema = z.object({
	label: z.string(),
	day: DayOfWeekEnum,
	startTime: z.string().time(),
	endTime: z.string().time(),
});
export type Period = z.infer<typeof PeriodSchema>;

export const ActivitySchema = z.object({
	label: z.string().optional(),
	periods: z.array(
		PeriodSchema.merge(
			z.object({
				category: z.string().optional(),
				color: z.string().optional(),
			}),
		),
	),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const ClassSchema = z.object({
	id: z.symbol(),
	classIdentifier: z.string(), //e.g. '302'
	periods: z.array(PeriodSchema),
	shown: z.boolean().default(true),
});
export type Class = z.infer<typeof ClassSchema>;

export const SubjectSchema = z.object({
	title: z.string(), //e.g. 'Math'
	classes: z.array(ClassSchema),
	category: z.string().optional(),
	color: z.string().optional(),
});
export type Subject = z.infer<typeof SubjectSchema>;

export const OutputSubjectSchema = SubjectSchema.omit({
	classes: true,
}).merge(
	z.object({
		class: ClassSchema,
	}),
);
export type OutputSubject = z.infer<typeof OutputSubjectSchema>;

export const OutputScheduleSchema = z.object({
	subjects: z.array(OutputSubjectSchema),
	enrolledClasses: z.array(OutputSubjectSchema),
	activities: z.array(ActivitySchema),
});
export type OutputSchedule = z.infer<typeof OutputScheduleSchema>;

export const TimeSlotSchema = z
	.object({
		startTime: z.string().time(),
		endTime: z.string().time(),
	})
	.required();

export const SchedulePenaltySchema = z.object({
	//? Penalty for breaking expectations, e.g. 'lunch at 12pm'
	cultural: z.number(),
	//? Penalty for breaking hard constraints, e.g. 'end day before 6pm'
	constraints: z.number(),
	dna: z.number(),
	//? Penalty for straining attention, e.g. 'Not starting with favorite subject'
	// awareness: z.number(),
	//? Penalty for not considering class difficulty (to implement)
	// awareness: z.number().optional()
	//? Penalty for repetitive blocks, e.g. 'Math and Algebra back-to-back' (to implement)
	// repetitiveness: z.number(),
});
export type SchedulePenalty = z.infer<typeof SchedulePenaltySchema>;

export const ScheduleSchema = z.object({
	populationSize: z.number(),
	generations: z.number(),
	mutationRate: z.number(),
	elitismCount: z.number(),
	tournamentSize: z.number(),
	subjects: z.array(SubjectSchema),
	//? Activities are events that are not related to a subject, e.g. 'Gym'
	activities: z.array(ActivitySchema),
	//? Enrolled classes are fixed events that must be considered in the schedule, and it's subject should not be repeated
	enrolledClasses: z.array(OutputSubjectSchema),
	//? The maximum amount of time that can be scheduled in a day
	dailyHourLimit: z.number(),
	//? An array of time slots to divide the day into, applies to all days
	timeSlots: z.array(TimeSlotSchema),
	//? Makes events closer to the start or end of the day, maybe add a 'between' option
	alignment: z.enum(["start", "end"]),
	penalties: SchedulePenaltySchema,
});
export type Schedule = z.infer<typeof ScheduleSchema>;
