###
# busy-web ember-cli install and update script
#
###

# Operating System Type
UNAME_S := $(shell uname -s)

# version info
YARN_VERSION := $(shell yarn --version 2>/dev/null)

# folder info
NODE_FILES := $(shell stat -f %N ./node_modules 2>/dev/null)
DIST_FILES := $(shell stat -f %N ./dist 2>/dev/null)
TMP_FILES := $(shell stat -f %N ./tmp 2>/dev/null)

# standard commands
all: clean install

# Install project packages
install:
	yarn

lockfile: clean
	rm -f yarn.lock
	yarn install

# cleanup files and clear caches
clean:
ifdef NODE_FILES # remove node files
	rm -rf ./node_modules
endif
ifdef DIST_FILES # remove dist files
	rm -rf ./dist
endif
ifdef TMP_FILES # remove tmp files
	rm -rf ./tmp
endif

help:
	@echo ""
	@echo "busybusy web tools: make"
	@echo "version: 2.0"
	@echo ""
	@echo "commands: "
	@echo "  default: (all)"
	@echo "    * Fresh install of dev environment"
	@echo "    * Run just 'make' to execute the default command"
	@echo ""
	@echo "  clean: "
	@echo "    * Removes all packages and build files"
	@echo ""
	@echo "  install: "
	@echo "    * Set up dev environment dependency packes"
	@echo ""
	@echo "  lockfile: "
	@echo "    * Deletes the yarn.lock file regenerates a new lock file after install"
	@echo ""
