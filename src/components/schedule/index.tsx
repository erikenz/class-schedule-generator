import { utnSubjectsPreset } from "@/components/schedule/presets/utn";
import { ScheduleFormComponent } from "@/components/schedule/schedule-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type DayOfWeek,
	GeneticAlgorithm,
	type Schedule,
	type SchedulePenalty,
	ScheduleSchema,
	geneticAlgorithm,
	getPeriodDate,
} from "@/lib/schedule-generator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	addHours,
	format,
	getDay,
	parse,
	startOfHour,
	startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Calendar, type Event, dateFnsLocalizer } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RefreshCcwIcon } from "lucide-react";
import { useForm } from "react-hook-form";
const locales = {
	"en-US": enUS,
};

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

export const ScheduleComponent = () => {
	const [events, setEvents] = useState<Event[]>([]);

	const form = useForm<Schedule>({
		resolver: zodResolver(ScheduleSchema),
		defaultValues: {
			elitismCount: 2,
			generations: 50,
			mutationRate: 0.1,
			tournamentSize: 2,
			populationSize: 50,

			dailyHourLimit: 6,
			alignment: "start",
			subjects: utnSubjectsPreset,
			activities: [
				{
					label: "Gym",
					periods: [
						{
							label: "Gym",
							day: "Monday",
							startTime: "18:00:00",
							endTime: "20:00:00",
							category: "activity",
						},
						// {
						// 	label: "Gym",
						// 	day: "Wednesday",
						// 	startTime: "07:00:00",
						// 	endTime: "09:00:00",
						// 	category: "activity",
						// },
					],
				},
			],
			timeSlots: [
				{ startTime: "07:15:00", endTime: "08:00:00" },
				{ startTime: "08:00:00", endTime: "08:45:00" },
				{ startTime: "08:45:00", endTime: "09:45:00" },
				{ startTime: "09:30:00", endTime: "10:30:00" },
				{ startTime: "10:30:00", endTime: "11:15:00" },
				{ startTime: "11:15:00", endTime: "12:05:00" },
				{ startTime: "12:05:00", endTime: "12:50:00" },
				{ startTime: "12:50:00", endTime: "13:35:00" },
				{ startTime: "13:35:00", endTime: "14:10:00" },
				{ startTime: "14:15:00", endTime: "15:00:00" },
				{ startTime: "15:00:00", endTime: "15:45:00" },
				{ startTime: "16:05:00", endTime: "16:50:00" },
				{ startTime: "16:50:00", endTime: "17:35:00" },
				{ startTime: "17:40:00", endTime: "18:25:00" },
				{ startTime: "18:35:00", endTime: "19:15:00" },
				{ startTime: "19:15:00", endTime: "20:00:00" },
				{ startTime: "20:00:00", endTime: "20:45:00" },
				{ startTime: "21:05:00", endTime: "21:50:00" },
				{ startTime: "21:50:00", endTime: "22:35:00" },
				{ startTime: "22:40:00", endTime: "23:25:00" },
				{ startTime: "23:25:00", endTime: "00:10:00" },
			],
			enrolledClasses: [
				{
					title: "Programación",
					class: {
						id: Symbol(),
						classIdentifier: "305",
						periods: [
							{
								label: "Theory",
								day: "Monday",
								startTime: "10:30:00",
								endTime: "12:00:00",
							},
							{
								label: "Practice",
								day: "Wednesday",
								startTime: "10:30:00",
								endTime: "12:00:00",
							},
						],
					},
				},
			],
			penalties: {
				cultural: 5,
				constraints: 10,
				dna: 1,
			},
		},
	});
	useEffect(() => {
		console.log("errors", form.formState.errors);
	}, [form.formState.errors]);

	function handleSubmit(scheduleConfig: Schedule) {
		// const bestSchedule = geneticAlgorithm(scheduleConfig);
		// console.log("Best Schedule:", bestSchedule);
		const ga = new GeneticAlgorithm(scheduleConfig);
		const bestSchedule = ga.run();
		console.log(bestSchedule);
		const newEvents: Event[] = bestSchedule.subjects.flatMap((event) => {
			if (!event.class.shown) return [];
			return event.class.periods.map((period) => {
				const periodDate = getPeriodDate(
					period.day,
					period.startTime,
					period.endTime,
				);
				return {
					title: `${event.class.classIdentifier} - ${event.title} - ${period.label}`,
					start: periodDate.start,
					end: periodDate.end,
				};
			});
		});
		const enrolledClasses = bestSchedule.enrolledClasses.flatMap((event) => {
			return event.class.periods.map((period) => {
				const periodDate = getPeriodDate(
					period.day,
					period.startTime,
					period.endTime,
				);
				return {
					title: `${event.class.classIdentifier} - ${event.title} - ${period.label}`,
					start: periodDate.start,
					end: periodDate.end,
				};
			});
		});
		const activities: Event[] = scheduleConfig.activities.flatMap(
			(activity) => {
				return activity.periods.map((period) => {
					const periodDate = getPeriodDate(
						period.day,
						period.startTime,
						period.endTime,
					);
					return {
						title: activity.label || "Activity",
						start: periodDate.start,
						end: periodDate.end,
						resource: "activity",
					};
				});
			},
		);
		console.log("file: index.tsx:77 > newEvents:", newEvents);
		setEvents([...newEvents, ...activities, ...enrolledClasses]);
	}
	return (
		<div className="flex gap-8">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
					<Tabs defaultValue="schedule" className="w-full">
						<TabsList>
							<Button
								size={"icon"}
								type="submit"
								className="mx-2 size-4"
								variant={"outline"}
							>
								<RefreshCcwIcon />
							</Button>
							<TabsTrigger value="schedule">Schedule</TabsTrigger>
							<TabsTrigger value="config">Config</TabsTrigger>
						</TabsList>
						<TabsContent value="schedule">
							<section className="h-auto w-full">
								<Calendar
									localizer={localizer}
									events={events}
									startAccessor="start"
									endAccessor="end"
									style={{ height: 800 }}
									defaultView="week"
									eventPropGetter={(event) => {
										return {
											style: {
												backgroundColor:
													event.resource === "activity"
														? "orange"
														: "lightblue",
											},
										};
									}}
								/>
							</section>
						</TabsContent>
						<TabsContent value="config">
							<section className="">
								<ScheduleFormComponent />
							</section>
						</TabsContent>
					</Tabs>
				</form>
			</Form>
		</div>
	);
};
