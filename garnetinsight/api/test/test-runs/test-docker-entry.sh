#!/bin/sh

# Initializing system's secret storage
eval "$(dbus-launch --sh-syntax)"

mkdir -p ~/.cache
mkdir -p ~/.local/share/keyrings
# fix "Remote error from secret service:
# org.freedesktop.Secret.Error.IsLocked: Cannot create an item in a locked collection" issue
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"
sleep 1
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --start)"

exec "$@"
