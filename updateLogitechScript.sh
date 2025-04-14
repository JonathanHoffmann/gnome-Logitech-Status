#!/bin/zsh

# Get deduplicated battery lines
output=$(solaar show | grep Battery | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | uniq)

# Get the first relevant battery line
line=$(echo "$output" | head -n 1)

# Extract percentage
percentage=$(echo "$line" | grep -oE '[0-9]+')

# Extract charging/discharging/recharging
# charge status: https://github.com/pwr-Solaar/Solaar/blob/33a06ac83487ab55452e38023e8426cb24686a81/lib/logitech_receiver/common.py#L593
battery_status=$(echo "$line" | grep -oEi 'discharging|recharging|almost_full|full|slow_recharge|invalid_battery|thermal_error' | tr '[:upper:]' '[:lower:]')

# Write to /tmp files
[[ -n "$percentage" ]] && echo "$percentage" > /tmp/logitech_battery_percentage.txt
[[ -n "$battery_status" ]] && echo "$battery_status" > /tmp/logitech_battery_status.txt
