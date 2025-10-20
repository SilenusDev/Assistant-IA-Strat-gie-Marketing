SHELL := /bin/bash

.PHONY: install-dev install lint format test migrate upgrade downgrade

install-dev:
	pip install --upgrade pip
	pip install -r requirements-dev.txt

install:
	pip install --upgrade pip
	pip install -r requirements.txt

lint:
	ruff check app tests
	mypy app

format:
	black app tests

test:
	pytest

migrate:
	flask db migrate

upgrade:
	flask db upgrade

downgrade:
	flask db downgrade
