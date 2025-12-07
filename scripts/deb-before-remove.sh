#!/bin/bash
set -e

OLD_INSTALL_PATH="/opt/Garnet Insight"
NEW_INSTALL_PATH="/opt/garnetinsight"
SYMLINK_PATH="/usr/bin/garnetinsight"
DESKTOP_FILE="/usr/share/applications/garnetinsight.desktop"

RUNNING_PIDS=$(pgrep -f "$NEW_INSTALL_PATH/garnetinsight" || pgrep -f "$OLD_INSTALL_PATH/garnetinsight" || true)

for PID in $RUNNING_PIDS; do
    echo "Found running GarnetInsight instance (PID: $PID), terminating..."
    kill $PID 2>/dev/null || true
done

sleep 2

REMAINING_PIDS=$(pgrep -f "$NEW_INSTALL_PATH/garnetinsight" || pgrep -f "$OLD_INSTALL_PATH/garnetinsight" || true)
for PID in $REMAINING_PIDS; do
    echo "Force killing remaining GarnetInsight instance (PID: $PID)..."
    kill -9 $PID 2>/dev/null || true
done

if [ -L "$SYMLINK_PATH" ]; then
    echo "Removing symlink: $SYMLINK_PATH"
    rm -f "$SYMLINK_PATH" || true
fi

if [ -d "$NEW_INSTALL_PATH" ]; then
    echo "Removing directory: $NEW_INSTALL_PATH"
    rm -rf "$NEW_INSTALL_PATH" || true
fi

if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Removing old directory: $OLD_INSTALL_PATH" #if it still exists for any reason
    rm -rf "$OLD_INSTALL_PATH" || true
fi

if command -v update-desktop-database >/dev/null 2>&1; then
    echo "Updating desktop database..."
    update-desktop-database 2>/dev/null || true
fi

echo "GarnetInsight cleanup completed successfully" 
