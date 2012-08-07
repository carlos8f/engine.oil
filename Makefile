all: build build-dev

REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) --timeout 60000

build:
	cp ./node_modules/engine.io-client/dist/engine.io.js public/engine.io.js
	cat ./node_modules/hydration/hydration.js >> public/engine.io.js
	@./node_modules/.bin/browserbuild \
		-g oil \
		-m engine.oil-client -b client/ \
		client >> public/engine.io.js

build-dev:
	cp ./node_modules/engine.io-client/dist/engine.io-dev.js public/engine.io-dev.js
	cat ./node_modules/hydration/hydration.js >> public/engine.io-dev.js
	@./node_modules/.bin/browserbuild \
		-g oil \
		-d -m engine.oil-client -b client/ \
		client >> public/engine.io-dev.js

.PHONY: test
