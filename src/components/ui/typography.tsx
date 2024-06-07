export function TypographyH1({ children }: { children: React.ReactNode }) {
	return (
		<h1 className="scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl">
			{children}
		</h1>
	);
}

export function TypographyH2({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">
			{children}
		</h2>
	);
}

export function TypographyH3({ children }: { children: React.ReactNode }) {
	return (
		<h3 className="scroll-m-20 font-semibold text-2xl tracking-tight">
			{children}
		</h3>
	);
}
export function TypographyH4({ children }: { children: React.ReactNode }) {
	return (
		<h4 className="scroll-m-20 font-semibold text-xl tracking-tight">
			{children}
		</h4>
	);
}
export function TypographyP({ children }: { children: React.ReactNode }) {
	return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}
export function TypographyBlockquote() {
	return (
		<blockquote className="mt-6 border-l-2 pl-6 italic">
			"After all," he said, "everyone enjoys a good joke, so it's only fair that
			they should pay for the privilege."
		</blockquote>
	);
}
export function TypographyList({ children }: { children: React.ReactNode }) {
	return <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>;
}
export function TypographyInlineCode({
	children,
}: { children: React.ReactNode }) {
	return (
		<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm">
			{children}
		</code>
	);
}
export function TypographyLead({ children }: { children: React.ReactNode }) {
	return <p className="text-muted-foreground text-xl">{children}</p>;
}
export function TypographyLarge({ children }: { children: React.ReactNode }) {
	return <div className="font-semibold text-lg">{children}</div>;
}
export function TypographySmall({ children }: { children: React.ReactNode }) {
	return <small className="font-medium text-sm leading-none">{children}</small>;
}
export function TypographyMuted({ children }: { children: React.ReactNode }) {
	return <p className="text-muted-foreground text-sm">{children}</p>;
}
