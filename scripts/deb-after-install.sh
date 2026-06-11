#!/bin/bash
set -e

# This hook has two parts:
#   1. RedisInsight migration (below, wrapped in a subshell) — kills running instances
#      and migrates the legacy "/opt/Redis Insight" install path to "/opt/redisinsight".
#      The subshell is what lets us keep this logic untouched: its internal `exit 0`
#      calls end only the subshell, so part 2 always runs afterwards.
#   2. electron-builder's default after-install (appended at the bottom) — the /usr/bin
#      symlink, the conditional chrome-sandbox chmod, the AppArmor profile install for
#      Ubuntu 24+ (which fixes "No usable sandbox" on Ubuntu 23.10+/24.04), and the
#      mime/desktop-database refresh. Setting deb.afterInstall makes electron-builder use
#      THIS script instead of its default, so we have to carry the default ourselves.
#      Part 2 is copied VERBATIM from app-builder-lib/templates/linux/after-install.tpl
#      (electron-builder 26.15.2) — re-copy it from node_modules when bumping
#      electron-builder. Its ${executable} / ${sanitizedProductName} placeholders are
#      interpolated by electron-builder at build time.

# ---------------------------------------------------------------------------
# Part 1 — RedisInsight migration (unchanged; subshell isolates its `exit 0`)
# ---------------------------------------------------------------------------
(
OLD_INSTALL_PATH="/opt/Redis Insight"
NEW_INSTALL_PATH="/opt/redisinsight"
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"


echo "Checking for running RedisInsight instances..."
RUNNING_PIDS=$(pgrep -f "$NEW_INSTALL_PATH/redisinsight" || pgrep -f "$OLD_INSTALL_PATH/redisinsight" || true)

OUR_PID=$$
for PID in $RUNNING_PIDS; do
    if ! ps -o pid= --ppid $OUR_PID | grep -q $PID; then
        echo "Found running RedisInsight instance (PID: $PID), attempting to terminate..."
        kill $PID 2>/dev/null || true
    fi
done

# Brief pause to let processes terminate
sleep 1

if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file for launcher compatibility..."

    # First replace the old path with the new path throughout the file
    sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE" || true

    # Then ensure the Exec line is properly formatted without quotes
    sed -i "s|^Exec=.*|Exec=$NEW_INSTALL_PATH/redisinsight %U|g" "$DESKTOP_FILE" || true

    # Update desktop database to refresh the icon
    update-desktop-database 2>/dev/null || true
fi

# Handle update case: redisinsight exists, Redis Insight exists too
# This means that we are in an update scenario
if [ -d "$NEW_INSTALL_PATH" ] && [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Both old and new paths exist - handling update scenario"

    cp -rf "$OLD_INSTALL_PATH"/* "$NEW_INSTALL_PATH"/ || true

    rm -rf "$OLD_INSTALL_PATH" || true

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true
    if [ -f "$NEW_INSTALL_PATH/redisinsight" ]; then
        chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    fi
    if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
        chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
        chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
    fi

    echo "Update handled successfully"
    exit 0
fi

# Handle simple auto-update case: only redisinsight exists
if [ -d "$NEW_INSTALL_PATH" ] && [ ! -d "$OLD_INSTALL_PATH" ]; then
    echo "New path exists but old doesn't - likely clean install or auto-update"

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true
    if [ -f "$NEW_INSTALL_PATH/redisinsight" ]; then
        chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    fi
    if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
        chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
        chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
    fi

    echo "Installation/update completed successfully"
    exit 0
fi

# Handle migration case: only Redis Insight exists.
#This is to ensure that if somebody updates from a very old version to a newer one, we'll still migrate it as expected
if [ ! -d "$NEW_INSTALL_PATH" ] && [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Old path found but new doesn't exist - migrating to new path"

    # Simply move the directory
    mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH" || true

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true
    if [ -f "$NEW_INSTALL_PATH/redisinsight" ]; then
        chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    fi
    if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
        chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
        chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
    fi

    echo "Migration completed successfully"
    exit 0
fi

# Neither directory exists - unexpected state
echo "Neither old nor new path exists. This is an unexpected state."
echo "Creating new installation directory as a fallback"
mkdir -p "$NEW_INSTALL_PATH" || true

# Always set up the binary link
ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true

echo "Post-installation completed with warnings"
) || true

# ---------------------------------------------------------------------------
# Part 2 — electron-builder default after-install
# Copied verbatim from app-builder-lib/templates/linux/after-install.tpl (26.15.2).
# Keep in sync when bumping electron-builder.
# ---------------------------------------------------------------------------
if type update-alternatives >/dev/null 2>&1; then
    # Remove previous link if it doesn't use update-alternatives
    if [ -L '/usr/bin/${executable}' -a -e '/usr/bin/${executable}' -a "`readlink '/usr/bin/${executable}'`" != '/etc/alternatives/${executable}' ]; then
        rm -f '/usr/bin/${executable}'
    fi
    update-alternatives --install '/usr/bin/${executable}' '${executable}' '/opt/${sanitizedProductName}/${executable}' 100 || ln -sf '/opt/${sanitizedProductName}/${executable}' '/usr/bin/${executable}'
else
    ln -sf '/opt/${sanitizedProductName}/${executable}' '/usr/bin/${executable}'
fi

# Check if user namespaces are supported by the kernel and working with a quick test:
if ! { [[ -L /proc/self/ns/user ]] && unshare --user true; }; then
    # Use SUID chrome-sandbox only on systems without user namespaces:
    chmod 4755 '/opt/${sanitizedProductName}/chrome-sandbox' || true
else
    chmod 0755 '/opt/${sanitizedProductName}/chrome-sandbox' || true
fi

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi

# Install apparmor profile. (Ubuntu 24+)
# First check if the version of AppArmor running on the device supports our profile.
# This is in order to keep backwards compatibility with Ubuntu 22.04 which does not support abi/4.0.
# In that case, we just skip installing the profile since the app runs fine without it on 22.04.
#
# Those apparmor_parser flags are akin to performing a dry run of loading a profile.
# https://wiki.debian.org/AppArmor/HowToUse#Dumping_profiles
#
# Unfortunately, at the moment AppArmor doesn't have a good story for backwards compatibility.
# https://askubuntu.com/questions/1517272/writing-a-backwards-compatible-apparmor-profile
if apparmor_status --enabled > /dev/null 2>&1; then
  APPARMOR_PROFILE_SOURCE='/opt/${sanitizedProductName}/resources/apparmor-profile'
  APPARMOR_PROFILE_TARGET='/etc/apparmor.d/${executable}'
  if apparmor_parser --skip-kernel-load --debug "$APPARMOR_PROFILE_SOURCE" > /dev/null 2>&1; then
    cp -f "$APPARMOR_PROFILE_SOURCE" "$APPARMOR_PROFILE_TARGET"

    # Updating the current AppArmor profile is not possible and probably not meaningful in a chroot'ed environment.
    # Use cases are for example environments where images for clients are maintained.
    # There, AppArmor might correctly be installed, but live updating makes no sense.
    if ! { [ -x '/usr/bin/ischroot' ] && /usr/bin/ischroot; } && hash apparmor_parser 2>/dev/null; then
      # Extra flags taken from dh_apparmor:
      # > By using '-W -T' we ensure that any abstraction updates are also pulled in.
      # https://wiki.debian.org/AppArmor/Contribute/FirstTimeProfileImport
      apparmor_parser --replace --write-cache --skip-read-cache "$APPARMOR_PROFILE_TARGET"
    fi
  else
    echo "Skipping the installation of the AppArmor profile as this version of AppArmor does not seem to support the bundled profile"
  fi
fi
