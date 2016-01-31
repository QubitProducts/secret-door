BIN = ./node_modules/.bin

SRC = lib
TESTS = test
DIST = dist

.PHONY: test watch clean

test: clean
	make build
	$(BIN)/jshint --reporter node_modules/jshint-stylish/stylish.js $(SRC) $(TESTS)
	$(BIN)/jscs $(SRC) $(TESTS)
	$(BIN)/karma start --single-run
	make clean

watch: build
	node watchAndRebuild.js

clean:
	rm -rf coverage
	rm -rf dist

builddir:
	mkdir dist

build: clean builddir
	$(BIN)/rollup -n Door -f umd index.js > $(DIST)/door-umd.js
	$(BIN)/rollup index.js > $(DIST)/door-es6.js
