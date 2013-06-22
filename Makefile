all: build

REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 60s \
		--bail

build:
	@component build --standalone oil
	@mv build/build.js public/engine.io.js
	@rm -rf build

.PHONY: test
