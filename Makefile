all: install clear-dist build-dist publish-all

install:
	cd packages/cache; npm install
	cd packages/complete; npm install
	cd packages/enrich; npm install

packages/cache/dist:
	cd packages/cache; npm run prepublish

packages/complete/dist:
	cd packages/cache; npm run prepublish

packages/enrich/dist:
	cd packages/cache; npm run prepublish

clear-dist:
	rm -rf packages/cache/dist
	rm -rf packages/complete/dist
	rm -rf packages/enrich/dist

build-dist: packages/cache/dist packages/complete/dist packages/enrich/dist

publish-all:
	cd packages/cache; npm publish
	cd packages/complete; npm publish
	cd packages/enrich; npm publish

.PHONY: clear-dist build-dist publish-all