# newtelco-snmp

Newtelco SNMP Checker designed to check dry contact environment sensors faster than any existing solution out there.

## Design

Currently it checks via SNMP all attached dry contacts to the [ServersCheck](https://serverscheck.com/sensors/sensor_io_drycontact.asp) platform.

It then compares if anything has changed since the last check, and if so - alerts users via Telegram / Email.

## Config

Create a `config.json` file with the following contents and pass the filename as the first argument to the application.

```json 
{
  "hosts": [
    {
      "address": "",
      "label": "",
      "community": ""
    }
  ],
  "alerts": {
    "email": {
      "host": "",
      "port": "",
      "from": "",
      "user": "",
      "pw": "",
      "to": ["", ""]
    },
    "telegram": {
      "token": "",
      "people": ["", ""]
    }
  }
}
```

## Usage

`npx node-snmp config.json`
