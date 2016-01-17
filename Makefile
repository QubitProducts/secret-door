BIN = ./node_modules/.bin

SRC = lib
TESTS = test
DIST = dist

.PHONY: test watch clean

test: clean
	$(BIN)/jshint --reporter node_modules/jshint-stylish/stylish.js $(SRC) $(TESTS)
	$(BIN)/jscs $(SRC) $(TESTS)
	$(BIN)/karma start --single-run
	make clean

watch:
	$(BIN)/karma start

clean:
	rm -rf coverage

build:
	$(BIN)/rollup -n Door -f umd index.js > $(DIST)/door-umd.js
	$(BIN)/rollup index.js > $(DIST)/door-es6.js
