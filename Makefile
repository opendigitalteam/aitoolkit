all: install clear-dist build-dist

install:
	cd packages/cache; npm install
	cd packages/complete; npm install
	cd packages/search; npm install

packages/cache/dist:
	cd packages/cache; npm run prepublish

packages/complete/dist:
	cd packages/cache; npm run prepublish

packages/search/dist:
	cd packages/search; npm run prepublish

clear-dist:
	rm -rf packages/cache/dist
	rm -rf packages/complete/dist
	rm -rf packages/search/dist

build-dist: packages/cache/dist packages/complete/dist packages/search/dist

.PHONY: install clear-dist build-dist