.PHONY: sync lint test rebuild fmt

sync:
	uv sync

lint:
	uv run ruff check app tests
	uv run pyright app

fmt:
	uv run ruff format app tests
	uv run ruff check --fix app tests

test:
	uv run pytest

rebuild:
	uv run braindump rebuild
