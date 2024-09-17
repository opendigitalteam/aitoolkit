all: install clear-dist build-dist

install:
	npm install
	npm install -w packages/agentic
	npm install -w packages/cache
	npm install -w packages/complete
	npm install -w packages/enrich
	npm install -w packages/search

packages/agentic/dist:
	npm run prepublish -w packages/agentic

packages/cache/dist:
	npm run prepublish -w packages/cache

packages/complete/dist:
	npm run prepublish -w packages/complete

packages/enrich/dist:
	npm run prepublish -w packages/enrich

packages/search/dist:
	npm run prepublish -w packages/search

clear-dist:
	rm -rf packages/agentic/dist
	rm -rf packages/cache/dist
	rm -rf packages/complete/dist
	rm -rf packages/enrich/dist
	rm -rf packages/search/dist

build-dist: packages/agentic/dist packages/cache/dist packages/complete/dist packages/enrich packages/search/dist

publish-all: all
	npm publish -w packages/agentic --access public
	npm publish -w packages/cache --access public
	npm publish -w packages/complete --access public
	npm publish -w packages/enrich --access public
	npm publish -w packages/search --access public

.PHONY: install clear-dist build-dist publish-all