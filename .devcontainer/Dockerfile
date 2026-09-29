# Development environment for COSI 106B HW2.
#
# You do not need to build this yourself. It is built and published to
# ghcr.io/brandeis-cosi-106b/hw2-fa26 by .github/workflows/build-image.yml, and
# .devcontainer/devcontainer.json simply *pulls* the finished image.
#
# Ubuntu 22.04 matches the Gradescope autograder's base image.
FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Keep in sync with DEPS_HOME in install-tools.sh.
# The packages' bin/ is first on PATH, so `eslint`, `tsc`, `vitest`, and `tsx`
# are simply available. Nothing to install per container.
# npm's "new major version available" notice is turned off: the version is pinned on purpose.
ENV PATH=/opt/hw2/node_modules/.bin:$PATH \
    NPM_CONFIG_UPDATE_NOTIFIER=false

COPY .devcontainer/install-tools.sh /tmp/install-tools.sh
COPY package.json package-lock.json /tmp/deps/

# Install Node.js and the locked npm packages (versions pinned in
# package-lock.json), then smoke-test the toolchain. If a dependency can't be
# installed on this platform, the image build fails here instead of on a
# student's laptop.
COPY .devcontainer/smoke-test.mjs /tmp/smoke/smoke-test.mjs
RUN bash /tmp/install-tools.sh /tmp/deps \
    && rm -rf /tmp/install-tools.sh /tmp/deps \
    && node /tmp/smoke/smoke-test.mjs \
    && rm -rf /tmp/smoke \
    && eslint --version \
    && tsc --version \
    && vitest --version \
    && tsx --version \
    && make --version | head -1
