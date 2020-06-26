#!/usr/bin/env bash
if [ -f ".env" ]; then
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
else
  echo "You need to create a .env file!"
fi
