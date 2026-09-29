#!/usr/bin/env bash
# Installs the exact toolchain HW2 is checked with.
#
# This ONE script is used in every place your code runs, so that all of them
# see identical tool versions (and therefore identical lint/type/test output):
#
#   1. .devcontainer/Dockerfile   -> the image you develop in (Docker / Codespaces)
#   2. .github/workflows/ci.yml   -> runs inside that same image
#   3. the Gradescope autograder  -> runs this script in its setup step
#
# Must run as root on Ubuntu 22.04 (x86_64 or arm64).
#
#   bash install-tools.sh              # Node.js and system tools only
#   bash install-tools.sh DEPS_DIR     # ...then the npm packages locked in
#                                      # DEPS_DIR/package.json + package-lock.json
#
# The npm packages (better-sqlite3, z3-solver, ESLint, TypeScript, vitest, ...) go into
# /opt/hw2/node_modules, OUTSIDE the repo, so nothing from your own laptop can
# collide with them. /node_modules links there: Node looks for packages in
# every parent folder up to /, so any folder in the container can import them.
# /opt/hw2/node_modules/.bin is on PATH (see the Dockerfile), so `eslint`,
# `tsc`, `vitest`, and `tsx` are simply available.
set -euo pipefail

NODE_VERSION="22.23.3"
DEPS_HOME=/opt/hw2

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
    ca-certificates curl git make xz-utils
rm -rf /var/lib/apt/lists/*

# Node.js (official build, checksum-verified; apt's version differs between Ubuntu releases)
case "$(uname -m)" in
    x86_64) node_arch=x64 ;;
    aarch64 | arm64) node_arch=arm64 ;;
    *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac
node_tar="node-v${NODE_VERSION}-linux-${node_arch}.tar.xz"
cd /tmp
curl -LsSfO "https://nodejs.org/dist/v${NODE_VERSION}/${node_tar}"
curl -LsSf "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" | grep " ${node_tar}\$" | sha256sum -c -
tar -xJf "${node_tar}" -C /usr/local --strip-components=1 --no-same-owner \
    --exclude='*/CHANGELOG.md' --exclude='*/README.md' --exclude='*/LICENSE'
rm "${node_tar}"

if [ "$#" -ge 1 ]; then
    mkdir -p "${DEPS_HOME}"
    cp "$1/package.json" "$1/package-lock.json" "${DEPS_HOME}/"
    (cd "${DEPS_HOME}" && npm ci --no-audit --no-fund --cache /tmp/npm-cache)
    rm -rf /tmp/npm-cache
    ln -sfn "${DEPS_HOME}/node_modules" /node_modules
    # Anyone (the `vscode` user in the dev container, root in CI/Gradescope) may read them
    chmod -R a+rX "${DEPS_HOME}"
fi

echo "Installed: node $(node --version), npm $(npm --version), $(make --version | head -1)"
