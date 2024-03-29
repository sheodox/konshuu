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
	updatedAt: Date;
	name: string;
	type: string;
	pinned: boolean;
	count: number;
	showCountUp: boolean;
	showCountDown: boolean;
	resetsDaily: boolean;
	currentDayTime: number;
	countHistory: AnytimeCountHistory[];
	notes: string;
	countdownEnd: Date;
	todos: AnytimeTodo[];
	tags: AnytimeTagAssignment[];
}

export interface AnytimeCountHistory {
	count: number;
	time: number;
}

export interface AnytimeTag {
	id: string;
	name: string;
	showOnAllAnytimes: boolean;
}

export interface AnytimeTagAssignment {
	id: string;
	anytimeTagId: string;
}

export type AnytimeNew = Pick<Anytime, 'name' | 'type' | 'countdownEnd'> & { tags: string[] };
export type AnytimeEditable = Pick<
	Anytime,
	'name' | 'count' | 'showCountUp' | 'showCountDown' | 'countdownEnd' | 'notes' | 'resetsDaily' | 'pinned'
>;
export type AnytimeTodoNew = Pick<AnytimeTodo, 'text' | 'href'>;
export type AnytimeTodoEditable = Pick<AnytimeTodo, 'text' | 'href' | 'completed'>;
