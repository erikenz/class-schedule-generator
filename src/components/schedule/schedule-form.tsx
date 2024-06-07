import { SubjectsFormField } from "@/components/schedule/subjects";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Schedule } from "@/lib/schedule-generator/types";
import { useFormContext } from "react-hook-form";

export function ScheduleFormComponent() {
	const { control, register } = useFormContext<Schedule>();

	return (
		<div>
			<FormField
				control={control}
				name="dailyHourLimit"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Daily hour limit</FormLabel>
						<FormControl>
							<Input
								placeholder="6"
								type="number"
								{...field}
								{...register("dailyHourLimit", {
									valueAsNumber: true,
								})}
							/>
						</FormControl>
						<FormDescription>
							Max hours you can spend on classes per day
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name="alignment"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Preferred time</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Select a preferred time of day" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="start">Start</SelectItem>
								<SelectItem value="end">End</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>
							This is only a preference, it's not a time restriction
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<SubjectsFormField />
			<Button type="submit">Save</Button>
		</div>
	);
}
