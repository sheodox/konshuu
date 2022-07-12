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
	todos: AnytimeTodo[];
}

export type AnytimeNew = Pick<Anytime, 'name' | 'type'>;
export type AnytimeEditable = Pick<Anytime, 'name' | 'count' | 'showCountUp' | 'showCountDown'>;
export type AnytimeTodoNew = Pick<AnytimeTodo, 'text' | 'href'>;
export type AnytimeTodoEditable = Pick<AnytimeTodo, 'text' | 'href' | 'completed'>;