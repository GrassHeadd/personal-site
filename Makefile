.PHONY: dev build lint install brain help

help: ## list commands
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

install: ## install web deps
	cd web && npm install

dev: ## run the site on http://localhost:3001
	cd web && npx next dev -p 3001

build: ## production build of the site
	cd web && npm run build

lint: ## lint the site
	cd web && npm run lint

brain: ## braindump shortcuts, e.g. `make brain cmd=lint`
	cd braindump && make $(or $(cmd),help)
