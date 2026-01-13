#!/bin/bash
set -e

OLD_INSTALL_PATH="/opt/Redis Insight"
NEW_INSTALL_PATH="/opt/redisinsight"
SYMLINK_PATH="/usr/bin/redisinsight"

# Function to kill running RedisInsight instances
kill_running_instances() {
    echo "Checking for running RedisInsight instances..."
    RUNNING_PIDS=$(pgrep -f "$NEW_INSTALL_PATH/redisinsight" || pgrep -f "$OLD_INSTALL_PATH/redisinsight" || true)

    for PID in $RUNNING_PIDS; do
        echo "Found running RedisInsight instance (PID: $PID), terminating..."
        kill $PID 2>/dev/null || true
    done

    sleep 2

    REMAINING_PIDS=$(pgrep -f "$NEW_INSTALL_PATH/redisinsight" || pgrep -f "$OLD_INSTALL_PATH/redisinsight" || true)
    for PID in $REMAINING_PIDS; do
        echo "Force killing remaining RedisInsight instance (PID: $PID)..."
        kill -9 $PID 2>/dev/null || true
    done
    echo "All running RedisInsight instances terminated."
}

# Always kill running instances regardless of action
kill_running_instances

case "$1" in
    upgrade)
        echo "Upgrade detected - skipping directory removal"
        # During upgrade, dpkg handles file replacement
        # We only need to ensure processes are stopped
        exit 0
        ;;
    remove|purge)
        echo "Removal detected - performing full cleanup"

        if [ -L "$SYMLINK_PATH" ]; then
            echo "Removing symlink: $SYMLINK_PATH"
            rm -f "$SYMLINK_PATH" || true
        fi

        if [ -d "$NEW_INSTALL_PATH" ]; then
            echo "Removing directory: $NEW_INSTALL_PATH"
            rm -rf "$NEW_INSTALL_PATH" || true
        fi

        if [ -d "$OLD_INSTALL_PATH" ]; then
            echo "Removing old directory: $OLD_INSTALL_PATH"
            rm -rf "$OLD_INSTALL_PATH" || true
        fi

        if command -v update-desktop-database >/dev/null 2>&1; then
            echo "Updating desktop database..."
            update-desktop-database 2>/dev/null || true
        fi

        echo "RedisInsight cleanup completed successfully"
        ;;
    *)
        echo "Unknown action: $1 - performing safe cleanup (processes only)"
        exit 0
        ;;
esac
