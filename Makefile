all: build

REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 60s \
		--bail

build:
	cp ./node_modules/engine.io-client/engine.io.js public/engine.io.js
	cat ./node_modules/hydration/hydration.js >> public/engine.io.js
	cat ./node_modules/idgen/idgen.js >> public/engine.io.js
	@./node_modules/.bin/browserbuild \
		-g oil \
		-m engine.oil-client -b client/ \
		client >> public/engine.io.js

.PHONY: test
