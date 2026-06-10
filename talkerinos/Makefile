.PHONY: migrate-up migrate-down run build

migrate-up:
	source .env && migrate -path sql/schema -database "$$DB_URL" up

migrate-down:
	source .env && migrate -path sql/schema -database "$$DB_URL" down

run:
	go run .

build:
	go build -o talkerinos .
