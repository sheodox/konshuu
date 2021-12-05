import { Registry, Counter, Gauge, collectDefaultMetrics } from 'prom-client';
import { prisma } from './prisma.js';

export const register = new Registry();
const name = (metricName: string) => `konshuu_${metricName}`;

const users = new Counter({
	name: name('users'),
	help: 'Total number of users.',
});

const todos = new Gauge({
	name: name('todos'),
	help: 'Total number of todos.',
});

[users, todos].forEach((metric) => register.registerMetric(metric));
collectDefaultMetrics({ register });

export default {
	users,
	todos,
};

async function seedMetrics() {
	users.inc(await prisma.user.count());
	todos.inc(await prisma.todo.count());
}
seedMetrics();
