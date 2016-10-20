###
# busybusy ember-cli update script
#
###

##
# Operating System Type
##
UNAME_S := $(shell uname -s)

##
# version info
##
YARN_VERSION := $(shell yarn --version 2>/dev/null)

##
# folder info
##
NODE_FILES := $(shell stat -f %N ./node_modules 2>/dev/null)
BOWER_FILES := $(shell stat -f %N ./bower_components 2>/dev/null)
DIST_FILES := $(shell stat -f %N ./dist 2>/dev/null)
TMP_FILES := $(shell stat -f %N ./tmp 2>/dev/null)

##
# user permission
##
PERMISSION := $(shell stat -f %Su:%Sg ~/.ssh 2>/dev/null)

##
# standard commands
##
all: install

##
# Install project packages
##
install:
ifdef YARN_VERSION
	yarn install
else
	npm install
	bower install
endif

##
# Upgrade npm and bower packages
##
upgrade:
ifdef YARN_VERSION
	yarn upgrade
else
	echo "Yarn is not installed!"
endif

##
# Installs the newest version of ember globally
##
ember-global:
ifdef YARN_VERSION
	yarn global ember-cli
else
	npm install -g ember-cli
endif

ember:
ifdef YARN_VERSION
	yarn upgrade ember-cli
	ember init
else
	npm install ember-cli
	ember init
endif

##
# cleanup files and clear caches
##
clean:
ifdef NODE_FILES # remove node files
	rm -r ./node_modules
endif
ifdef BOWER_FILES # remove bower files
	rm -r ./bower_components
endif
ifdef DIST_FILES # remove dist files
	rm -r ./dist
endif
ifdef TMP_FILES # remove tmp files
	rm -r ./tmp
endif
ifndef YARN_VERSION # clear cache for npm and bower if not using yarn
	npm cache clean
	bower cache clean
endif

##
# Change node file permission so sudo is not required for
# global installs.
##
permission:
ifdef PERMISSION
ifeq ($(UNAME_S),Darwin)
	sudo chown $(PERMISSION) /usr/local/bin/npm
else
	sudo chown $(PERMISSION) /usr/bin/npm
endif
	sudo chown -R $(PERMISSION) /usr/local/lib/node_modules
	sudo chown -R $(PERMISSION) ~/.npm
endif
