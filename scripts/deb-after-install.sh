#!/bin/bash
set -e

OLD_INSTALL_PATH="/opt/Garnet Insight"
NEW_INSTALL_PATH="/opt/garnetinsight"
DESKTOP_FILE="/usr/share/applications/garnetinsight.desktop"


echo "Checking for running GarnetInsight instances..."
RUNNING_PIDS=$(pgrep -f "$NEW_INSTALL_PATH/garnetinsight" || pgrep -f "$OLD_INSTALL_PATH/garnetinsight" || true)

OUR_PID=$$
for PID in $RUNNING_PIDS; do
    if ! ps -o pid= --ppid $OUR_PID | grep -q $PID; then
        echo "Found running GarnetInsight instance (PID: $PID), attempting to terminate..."
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
    sed -i "s|^Exec=.*|Exec=$NEW_INSTALL_PATH/garnetinsight %U|g" "$DESKTOP_FILE" || true

    # Update desktop database to refresh the icon
    update-desktop-database 2>/dev/null || true
fi

# Handle update case: garnetinsight exists, Garnet Insight exists too
# This means that we are in an update scenario
if [ -d "$NEW_INSTALL_PATH" ] && [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Both old and new paths exist - handling update scenario"

    cp -rf "$OLD_INSTALL_PATH"/* "$NEW_INSTALL_PATH"/ || true

    rm -rf "$OLD_INSTALL_PATH" || true

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/garnetinsight" "/usr/bin/garnetinsight" || true
    if [ -f "$NEW_INSTALL_PATH/garnetinsight" ]; then
        chmod +x "$NEW_INSTALL_PATH/garnetinsight" || true
    fi
    if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
        chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
        chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
    fi

    echo "Update handled successfully"
    exit 0
fi

# Handle simple auto-update case: only garnetinsight exists
if [ -d "$NEW_INSTALL_PATH" ] && [ ! -d "$OLD_INSTALL_PATH" ]; then
    echo "New path exists but old doesn't - likely clean install or auto-update"

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/garnetinsight" "/usr/bin/garnetinsight" || true
    if [ -f "$NEW_INSTALL_PATH/garnetinsight" ]; then
        chmod +x "$NEW_INSTALL_PATH/garnetinsight" || true
    fi
    if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
        chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
        chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
    fi

    echo "Installation/update completed successfully"
    exit 0
fi

# Handle migration case: only Garnet Insight exists.
#This is to ensure that if somebody updates from a very old version to a newer one, we'll still migrate it as expected
if [ ! -d "$NEW_INSTALL_PATH" ] && [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Old path found but new doesn't exist - migrating to new path"

    # Simply move the directory
    mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH" || true

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/garnetinsight" "/usr/bin/garnetinsight" || true
    if [ -f "$NEW_INSTALL_PATH/garnetinsight" ]; then
        chmod +x "$NEW_INSTALL_PATH/garnetinsight" || true
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
ln -sf "$NEW_INSTALL_PATH/garnetinsight" "/usr/bin/garnetinsight" || true

echo "Post-installation completed with warnings"
