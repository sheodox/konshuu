export interface AnytimeTodo {
	id: string;
	createdAt: Date;
	text: string;
	href: string;
	completed: boolean;
}

export interface Anytime {
	id: string;
	createdAt: Date;
	name: string;
	type: string;
	count: number;
	showCountUp: boolean;
	showCountDown: boolean;
	notes: string;
	countdownEnd: Date;
	todos: AnytimeTodo[];
	tags: AnytimeTagAssignment[];
}

export interface AnytimeTag {
	id: string;
	name: string;
}

export interface AnytimeTagAssignment {
	id: string;
	anytimeTagId: string;
}

export type AnytimeNew = Pick<Anytime, 'name' | 'type' | 'countdownEnd'> & { tags: string[] };
export type AnytimeEditable = Pick<
	Anytime,
	'name' | 'count' | 'showCountUp' | 'showCountDown' | 'countdownEnd' | 'notes'
>;
export type AnytimeTodoNew = Pick<AnytimeTodo, 'text' | 'href'>;
export type AnytimeTodoEditable = Pick<AnytimeTodo, 'text' | 'href' | 'completed'>;
