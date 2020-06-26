#!/usr/bin/env bash
if [ -f ".env" ]; then
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
else
  echo "You need to create a .env file!"
fi
