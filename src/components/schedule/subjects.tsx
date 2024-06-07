import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Schedule, ScheduleSchema } from "@/lib/schedule-generator/types";
import { PlusIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

export function SubjectsFormField() {
	const { control } = useFormContext<Schedule>();
	const { fields, append } = useFieldArray({
		name: "subjects",
		control,
	});
	return (
		<div>
			<Label>Subjects</Label>
			<Accordion type="multiple">
				{fields.map((field, subjectIndex) => (
					<div key={field.id} className="space-y-4">
						<AccordionItem value={field.id}>
							<div className="flex items-center">
								<Checkbox defaultChecked />

								<AccordionTrigger
									headerProps={{ className: "w-full" }}
									className="flex w-full flex-row-reverse items-center"
								>
									<FormField
										control={control}
										name={`subjects.${subjectIndex}.title`}
										render={({ field }) => (
											<FormItem className="w-full">
												<FormControl>
													<Input {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</AccordionTrigger>
							</div>
							<AccordionContent className="ml-4">
								<ClassesFormField subjectIndex={subjectIndex} />
							</AccordionContent>
						</AccordionItem>
					</div>
				))}
			</Accordion>
			<Button
				className="h-8 w-fit"
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					//@ts-expect-error - react-hook-form doesn't allow empty append
					append({});
				}}
			>
				<PlusIcon />
				Add subject
			</Button>
		</div>
	);
}

function ClassesFormField({ subjectIndex }: { subjectIndex: number }) {
	const { control } = useFormContext<Schedule>();
	const { fields, append } = useFieldArray({
		name: `subjects.${subjectIndex}.classes`,
		control,
	});
	return (
		<div>
			{fields.map((field, classIndex) => (
				<div key={field.id} className="space-y-4">
					<AccordionItem value={field.id}>
						<div className="flex items-center">
							<FormField
								control={control}
								name={`subjects.${subjectIndex}.classes.${classIndex}.shown`}
								defaultValue={true}
								render={({ field }) => (
									<FormItem className="flex items-center">
										<FormControl>
											<Checkbox
												defaultChecked
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<AccordionTrigger
								headerProps={{ className: "w-full" }}
								className="flex w-full flex-row-reverse"
							>
								<FormField
									control={control}
									name={`subjects.${subjectIndex}.classes.${classIndex}.classIdentifier`}
									render={({ field }) => (
										<FormItem className="w-full">
											<FormControl>
												<Input {...field} placeholder="301" />
											</FormControl>
										</FormItem>
									)}
								/>
							</AccordionTrigger>
						</div>
						<AccordionContent className="ml-8">
							<PeriodsFormField
								subjectIndex={subjectIndex}
								classIndex={classIndex}
							/>
						</AccordionContent>
					</AccordionItem>
				</div>
			))}
			<Button
				type="button"
				className="h-8 w-fit"
				onClick={(e) => {
					e.stopPropagation();
					//@ts-expect-error - react-hook-form doesn't allow empty append
					append({});
				}}
			>
				<PlusIcon />
				Add class
			</Button>
		</div>
	);
}

function PeriodsFormField({
	subjectIndex,
	classIndex,
}: { subjectIndex: number; classIndex: number }) {
	const { control } = useFormContext<Schedule>();
	const { fields, append } = useFieldArray({
		name: `subjects.${subjectIndex}.classes.${classIndex}.periods`,
		control,
	});
	return (
		<div>
			{fields.map((field, periodIndex, arr) => (
				<div key={field.id} className="space-y-4">
					{periodIndex > 0 && <div className="mt-4 h-px w-full bg-slate-500" />}
					<FormField
						control={control}
						name={`subjects.${subjectIndex}.classes.${classIndex}.periods.${periodIndex}.label`}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Label</FormLabel>
								<FormControl>
									<Input placeholder="Theory" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<div className="flex flex-col gap-4">
						<FormField
							control={control}
							name={`subjects.${subjectIndex}.classes.${classIndex}.periods.${periodIndex}.startTime`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Start time</FormLabel>
									<FormControl>
										<Input type="time" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name={`subjects.${subjectIndex}.classes.${classIndex}.periods.${periodIndex}.endTime`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>End time</FormLabel>
									<FormControl>
										<Input type="time" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				</div>
			))}
			<Button
				type="button"
				className="mt-4 h-8 w-fit"
				onClick={(e) => {
					e.stopPropagation();
					//@ts-expect-error - react-hook-form doesn't allow empty append
					append({});
				}}
			>
				<PlusIcon />
				Add period
			</Button>
		</div>
	);
}
