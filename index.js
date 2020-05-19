#!/usr/bin/node
process.env.NTBA_FIX_319 = 1

// EXAMPLE COMMAND:
// /usr/bin/snmpwalk -t '1' -r '3' -v2c -c n3wt3lco -Pud -OQUsn -M /mnt/data/observium/mibs/rfc:/mnt/data/observium/mibs/net-snmp 'udp':'172.16.60.73':'161' .1.3.6.1.4.1.17095.6

const snmp = require('snmp-native')
const TelegramBot = require('node-telegram-bot-api')
const Intl = require('intl')
const storage = require('node-persist')
const nodemailer = require('nodemailer')
storage.init()

const configFile = process.argv[2]
const configData = require(`./${configFile}`)

setInterval(() => {
  configData.hosts.forEach(host => {
    // Contacts
    const session = new snmp.Session({
      host: host.address,
      community: host.community
    })
    const contactStatus = []
    session.getSubtree({ oid: [1, 3, 6, 1, 4, 1, 17095, 6] }, function (
      error,
      varbinds
    ) {
      if (error) {
        console.log(`Fail - ${error}`)
      } else {
        for (let i = 0; i < varbinds.length; i += 3) {
          const vb1 = varbinds[i]
          const vb2 = varbinds[i + 1]

          if (!vb1.value.includes('Undefine') || !vb2.value.includes('Undefine')) {
            const sensorName = vb1.value
            const sensorValue = vb2.value

            storage
              .getItem(sensorName)
              .then(previousValue => {
                if (sensorValue !== previousValue) {
                  console.log(
                    sensorName,
                    previousValue,
                    sensorValue,
                    new Date().toLocaleString()
                  )
                  alertUser(sensorName, sensorValue)
                }
                contactStatus.push({ name: sensorName, value: sensorValue })
                // console.log(sensorName, sensorValue)
                storage.setItem(sensorName, sensorValue)
              })
              .catch(err => console.error(err))
          }
        }
      }
      session.close()
    })

    // Temperature
    // .1.3.6.1.4.1.17095.1000.1.3.0 = "23.74"
    const sessionTemp = new snmp.Session({
      host: host.address,
      community: host.community
    })
    sessionTemp.get({ oid: [1, 3, 6, 1, 4, 1, 17095, 1000, 1, 3, 0] }, function (
      error,
      varbind
    ) {
      if (error) {
        console.log(`Fail - ${error}`)
      } else {
        const temp = varbind[0].value
        console.log(temp)
        if (temp && temp > 26) {
          console.log(`Temp Alert - ${temp}`)

          storage
            .getItem(`${host.label}-temp`)
            .then(previousValue => {
              if (previousValue !== 'alert') {
                alertUser(`${host.label} Temp ALERT`, temp)
                console.log('Temp - Alert')
                storage.setItem(`${host.label}-temp`, 'alert')
              }
            })
        } else {
          storage
            .getItem(`${host.label}-temp`)
            .then(previousValue => {
              if (previousValue === 'alert') {
                alertUser(`${host.label} Temp Normalize`, temp)
                storage.setItem(`${host.label}-temp`, 'normal')
                console.log('Temp - Return to Normal')
              }
            })
        }
      }
      sessionTemp.close()
    })
  })
}, 5000)

const alertUser = (name, value) => {
  const token = configData.alerts.telegram.token // Newtelco Alert Bot
  const chatIds = configData.alerts.telegram.people

  const bot = new TelegramBot(token, { polling: false })
  const transport = nodemailer.createTransport({
    host: configData.alerts.email.host,
    port: configData.alerts.email.port,
    auth: {
      user: configData.alerts.email.user,
      pass: configData.alerts.email.pw
    }
  })

  const notify = (message, json) => {
    chatIds.forEach(chatId => {
      const df = new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
      const dateDE = df.format(new Date())
      try {
        // Telegram
        bot.sendMessage(
          chatId,
          `<b>${name}</b> has become <b>${value}</b> at ${dateDE}`,
          {
            parse_mode: 'html'
          }
        )
        // Email (SMTP)
        const message = {
          from: configData.alerts.email.from,
          to: configData.alerts.email.to.join(';'),
          subject: `ALERT ${name} - ${value}`,
          text: `Your sensor ${name} has changed to ${value} at ${dateDE}`
        }
        transport.sendMail(message, function (err, info) {
          if (err) {
            console.log(err)
          } else {
            // Success!
            console.log(info)
          }
        })
      } catch (err) {
        console.log(
          'Something went wrong when trying to send a Telegram notification',
          err
        )
      }
    })
  }
  notify()
}
