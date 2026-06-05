#!/usr/bin/env bash
# before_build_script — runs in-container AFTER build_dependencies are installed,
# BEFORE install.sh. Sets up node-gyp's python, pulls CRB-only headers on EL
# clones, and bootstraps nvm into /nvm + /profile (install.sh sources /profile).

set -xEeuo pipefail

# node-gyp needs a modern python3. Some distros default /usr/bin/python3 to a
# stale interpreter; point `python3` at the newest available via /usr/local/bin
# (higher PATH priority than /usr/bin, so distro tools like zypper/dnf keep
# using the system python). No-op when the system python3 is already current.
mkdir -p /usr/local/bin
for py in /usr/bin/python3.14 /usr/bin/python3.13 /usr/bin/python3.12 \
          /usr/bin/python3.11 /usr/bin/python3.10 /usr/bin/python3.9; do
  if [ -x "$py" ]; then
    ln -sf "$py" /usr/local/bin/python3
    break
  fi
done

# AlmaLinux/Rocky 9+ keep libsecret-devel (keytar's build dep) in CRB, which is
# disabled by default and can't be listed in build_dependencies (the initial dnf
# install runs before this script). Enable CRB and pull it in here. Fedora has no
# [crb] section -> skipped; non-dnf distros -> skipped.
if command -v dnf >/dev/null 2>&1 && \
   grep -qER '^\[(crb|CRB)\]' /etc/yum.repos.d/ 2>/dev/null; then
  dnf install -y --enablerepo=crb libsecret-devel
fi

# Debian/Ubuntu: install the libraries Electron's binaries link against, so
# dpkg-shlibdeps (kept enabled in debian/rules) can resolve every NEEDED soname
# to a package and emit accurate runtime Depends. Without these present the
# build, not the install, would fail with "couldn't find library ...". The only
# NEEDED lib with no system provider is the bundled libffmpeg.so, which
# dh_shlibdeps locates via -l (see debian/rules). t64 alternations cover the
# 64-bit time_t rename on Ubuntu 24.04+/Debian 13. apt-get satisfy picks the
# available alternative.
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -qy
  apt-get satisfy -y --no-install-recommends "\
    libgtk-3-0t64 | libgtk-3-0, \
    libglib2.0-0t64 | libglib2.0-0, \
    libatk1.0-0t64 | libatk1.0-0, \
    libatk-bridge2.0-0t64 | libatk-bridge2.0-0, \
    libcups2t64 | libcups2, \
    libasound2t64 | libasound2, \
    libatspi2.0-0t64 | libatspi2.0-0, \
    libnss3, libnspr4, libdbus-1-3, libcairo2, libpango-1.0-0, \
    libx11-6, libxcomposite1, libxdamage1, libxext6, libxfixes3, libxrandr2, \
    libgbm1, libexpat1, libxcb1, libxkbcommon0, libudev1, \
    libsecret-1-0, libgcc-s1, libstdc++6"
fi

# Bootstrap nvm into a fixed location so install.sh can source it.
export NVM_DIR=/nvm
export PROFILE=/profile

mkdir -p "$NVM_DIR"
touch "$PROFILE"

if nvm --version 2>/dev/null; then
  exit 0
fi

# nvm's installer auto-detects curl or wget; the base image provides one.
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash \
  || curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

source "$PROFILE"
nvm --version
