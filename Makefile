all: build

REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 60s \
		--bail

build:
	@./node_modules/.bin/component build --standalone oil --out public --name engine.io

.PHONY: test
