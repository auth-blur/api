.PHONY: build lib_build lib_rebuild clean start watch

default: format clean build lib_build

NEST_CLI=./node_modules/.bin/nest

clean:
			rm -rf ./dist
			rm -rf ./build

lib_build:
			node-gyp configure && node-gyp build

lib_rebuild: 
			node-gyp rebuild

build:
			$(NEST_CLI) build

start:
			$(NEST_CLI) start --watch

watch:
			$(NEST_CLI) start --watch

format:
			node scripts/prettier write-changed