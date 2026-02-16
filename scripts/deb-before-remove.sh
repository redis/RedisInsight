#!/bin/bash
set -e

OLD_INSTALL_PATH="/opt/Redis Insight"
NEW_INSTALL_PATH="/opt/redisinsight"
SYMLINK_PATH="/usr/bin/redisinsight"

# Function to safely find RedisInsight PIDs (excluding package manager processes)
get_redisinsight_pids() {
    SCRIPT_PID=$$
    PARENT_PID=$(ps -o ppid= -p $$ 2>/dev/null | tr -d ' ')

    for PID in $(pgrep -f "redisinsight" 2>/dev/null || true); do
        # Skip our own process and parent (dpkg/apt)
        [ "$PID" = "$SCRIPT_PID" ] && continue
        [ "$PID" = "$PARENT_PID" ] && continue

        # Get the command line for this PID
        CMDLINE=$(ps -o args= -p "$PID" 2>/dev/null || true)

        # Skip package manager processes
        case "$CMDLINE" in
            *dpkg*|*apt*|*deb-before-remove*|*deb-after-install*) continue ;;
        esac

        # Only match actual RedisInsight binary
        case "$CMDLINE" in
            */redisinsight*) echo "$PID" ;;
        esac
    done
}

# Function to kill running RedisInsight instances
kill_running_instances() {
    echo "Checking for running RedisInsight instances..."
    RUNNING_PIDS=$(get_redisinsight_pids)

    if [ -z "$RUNNING_PIDS" ]; then
        echo "No running RedisInsight instances found."
        return 0
    fi

    for PID in $RUNNING_PIDS; do
        echo "Found running RedisInsight instance (PID: $PID), terminating..."
        kill "$PID" 2>/dev/null || true
    done

    sleep 2

    REMAINING_PIDS=$(get_redisinsight_pids)
    for PID in $REMAINING_PIDS; do
        echo "Force killing remaining RedisInsight instance (PID: $PID)..."
        kill -9 "$PID" 2>/dev/null || true
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
