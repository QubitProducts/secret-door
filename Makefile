BIN = ./node_modules/.bin

SRC = lib
TESTS = test

.PHONY: test watch clean

test: clean
	$(BIN)/jshint --reporter node_modules/jshint-stylish/stylish.js $(SRC) $(TESTS)
	$(BIN)/jscs $(SRC) $(TESTS)
	$(BIN)/karma start --single-run

watch:
	$(BIN)/karma start

clean:
	rm -rf coverage