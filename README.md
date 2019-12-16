# node-snmp 

Newtelco SNMP Worker designed to check dry contact environment sensors faster than any existing solution out there.

## Design

Currently it checks via SNMP all attached dry contacts to the [ServersCheck](https://serverscheck.com/sensors/sensor_io_drycontact.asp) platform.

It then compares if anything has changed since the last check, and if so - alerts users via Telegram.

## Notes

There is a quick n' dirty script (`loop.sh`) included in the repo for testing - but I recommend using the systemd service file when running it in production.




