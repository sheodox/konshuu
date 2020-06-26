CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS todo_lists (
    todo_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp without time zone default (timezone('utc', now())),
    text text NOT NULL,
    date date NOT NULL,
    completed boolean DEFAULT false,
    list TEXT NOT NULL
);

