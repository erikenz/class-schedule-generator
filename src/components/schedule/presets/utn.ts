import type { Subject } from "@/lib/schedule-generator/types";

export const utnSubjectsPreset: Subject[] = [
	{
		title: "Comunicación de datos",
		classes: [
			{
				classIdentifier: "301",
				id: Symbol(),
				periods: [
					{
						label: "Monday",
						day: "Monday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
					{
						label: "Tuesday",
						day: "Tuesday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
				],
				shown: true,
			},
			{
				classIdentifier: "302",
				id: Symbol(),
				periods: [
					{
						label: "Monday",
						day: "Monday",
						startTime: "08:45:00",
						endTime: "10:30:00",
					},
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
				],
				shown: true,
			},
			{
				classIdentifier: "303",
				id: Symbol(),
				periods: [
					{
						label: "Thursday",
						day: "Thursday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
					{
						label: "Friday",
						day: "Friday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
				],
				shown: true,
			},
			{
				classIdentifier: "304",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "15:00:00",
						endTime: "16:50:00",
					},
					{
						label: "Friday",
						day: "Friday",
						startTime: "13:35:00",
						endTime: "15:00:00",
					},
				],
			},
		],
	},
	{
		title: "Probabilidad y estadística",
		classes: [
			{
				classIdentifier: "301",
				shown: true,
				id: Symbol(),
				periods: [
					{
						label: "Tuesday",
						day: "Tuesday",
						startTime: "10:30:00",
						endTime: "12:50:00",
					},
				],
			},
			{
				classIdentifier: "302",
				shown: true,
				id: Symbol(),
				periods: [
					{
						label: "Monday",
						day: "Monday",
						startTime: "10:30:00",
						endTime: "12:50:00",
					},
				],
			},
			{
				classIdentifier: "303",
				shown: true,
				id: Symbol(),
				periods: [
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "10:30:00",
						endTime: "12:50:00",
					},
				],
			},
			{
				classIdentifier: "304",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Tuesday",
						day: "Tuesday",
						startTime: "13:35:00",
						endTime: "15:45:00",
					},
				],
			},
		],
	},
	{
		title: "Desarrollo de software",
		classes: [
			{
				classIdentifier: "301",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
					{
						label: "Friday",
						day: "Friday",
						startTime: "11:20:00",
						endTime: "12:50:00",
					},
				],
			},
			{
				classIdentifier: "302",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "11:20:00",
						endTime: "12:50:00",
					},
					{
						label: "Friday",
						day: "Friday",
						startTime: "10:30:00",
						endTime: "12:05:00",
					},
				],
			},
			{
				classIdentifier: "303",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Friday",
						day: "Friday",
						startTime: "08:45:00",
						endTime: "10:30:00",
					},
					{
						label: "Friday",
						day: "Friday",
						startTime: "10:30:00",
						endTime: "12:05:00",
					},
				],
			},
			{
				classIdentifier: "304",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Friday",
						day: "Friday",
						startTime: "15:00:00",
						endTime: "16:50:00",
					},
					{
						label: "Friday",
						day: "Friday",
						startTime: "16:50:00",
						endTime: "18:25:00",
					},
				],
			},
		],
	},
	{
		title: "Diseño de sistemas de información",
		classes: [
			{
				classIdentifier: "301",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Tuesday",
						day: "Tuesday",
						startTime: "08:45:00",
						endTime: "10:30:00",
					},
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "08:45:00",
						endTime: "12:05:00",
					},
				],
			},
			{
				classIdentifier: "302",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Monday",
						day: "Monday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
					{
						label: "Friday",
						day: "Friday",
						startTime: "07:15:00",
						endTime: "10:30:00",
					},
				],
			},
			{
				classIdentifier: "303",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Tuesday",
						day: "Tuesday",
						startTime: "07:15:00",
						endTime: "08:45:00",
					},
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "07:15:00",
						endTime: "10:30:00",
					},
				],
			},
			{
				classIdentifier: "304",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "16:50:00",
						endTime: "18:25:00",
					},
					{
						label: "Thursday",
						day: "Thursday",
						startTime: "15:00:00",
						endTime: "18:25:00",
					},
				],
			},
		],
	},
	{
		title: "Bases de datos",
		classes: [
			{
				classIdentifier: "301",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Thursday",
						day: "Thursday",
						startTime: "07:15:00",
						endTime: "10:30:00",
					},
				],
			},
			{
				classIdentifier: "302",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Tuesday",
						day: "Tuesday",
						startTime: "08:00:00",
						endTime: "11:15:00",
					},
				],
			},
			{
				classIdentifier: "303",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Monday",
						day: "Monday",
						startTime: "08:00:00",
						endTime: "11:00:00",
					},
				],
			},
			{
				classIdentifier: "304",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "16:05:00",
						endTime: "19:15:00",
					},
				],
			},
		],
	},
	{
		title: "Economía",
		classes: [
			{
				classIdentifier: "301",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Friday",
						day: "Friday",
						startTime: "07:15:00",
						endTime: "09:30:00",
					},
				],
			},
			{
				classIdentifier: "302",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Wednesday",
						day: "Wednesday",
						startTime: "08:45:00",
						endTime: "11:15:00",
					},
				],
			},
			{
				classIdentifier: "303",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Tuesday",
						day: "Tuesday",
						startTime: "08:45:00",
						endTime: "11:15:00",
					},
				],
			},
			{
				classIdentifier: "304",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Thursday",
						day: "Thursday",
						startTime: "12:50:00",
						endTime: "15:00:00",
					},
				],
			},
		],
	},
	{
		title: "Análisis numérico",
		classes: [
			{
				classIdentifier: "301",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Thursday",
						day: "Thursday",
						startTime: "10:30:00",
						endTime: "12:50:00",
					},
				],
			},
			{
				classIdentifier: "302",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Thursday",
						day: "Thursday",
						startTime: "08:00:00",
						endTime: "10:30:00",
					},
				],
			},
			{
				classIdentifier: "303",
				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Thursday",
						day: "Thursday",
						startTime: "08:45:00",
						endTime: "11:15:00",
					},
				],
			},
			{
				classIdentifier: "304",

				id: Symbol(),
				shown: true,
				periods: [
					{
						label: "Monday",
						day: "Monday",
						startTime: "15:00:00",
						endTime: "17:35:00",
					},
				],
			},
		],
	},
];
