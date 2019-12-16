#!/usr/bin/node

// /usr/bin/snmpwalk -t '1' -r '3' -v2c -c n3wt3lco -Pud -OQUsn -M /mnt/data/observium/mibs/rfc:/mnt/data/observium/mibs/net-snmp 'udp':'192.168.11.223':'161' .1.3.6.1.4.1.17095.6

// Get Data
const snmp = require('snmp-native')
const TelegramBot = require('node-telegram-bot-api')

const session = new snmp.Session({ host: '192.168.11.223', community: 'n3wt3lco' })
const contactStatus = []
session.getSubtree({ oid: [1, 3, 6, 1, 4, 1, 17095, 6] }, function (error, varbinds) {
  if (error) {
    console.log('Fail :(')
  } else {
    // varbinds.forEach(function (vb) {
    for (let i = 0; i < varbinds.length; i += 3) {
      const vb1 = varbinds[i]
      const vb2 = varbinds[i + 1]
      //   const vb3 = varbinds[i + 2]

      if (!vb1.value.includes('Undefine')) {
        const sensorName = vb1.value
        const sensorValue = vb2.value
        // console.log(sensorName, sensorValue)
        contactStatus.push({ name: sensorName, value: sensorValue })
      }
    }
  }
  // console.log(JSON.stringify(contactStatus))
  session.close()

  // Notification
  contactStatus.forEach(contact => {
    if (contact.value !== 'OK') {
      console.log('ALERT: ', contact)
      const token = '842082296:AAEMAu6MIr9Y-tOhs5vWrL89p4JyK2T_64Q'
      const chatIds = [
        '211746862', // gbormet
        '497637886' // ndomino
      ]

      const bot = new TelegramBot(token, { polling: false })

      const telegrambot = (message, json) => {
        chatIds.forEach(chatId => {
          console.log(chatId)
          const date = new Date()
          try {
            bot.sendMessage(chatId, `${contact.name} has become ${contact.value} at ${date.toISOString()}`, {
              parse_mode: 'html'
            })
          } catch (err) {
            console.log('Something went wrong when trying to send a Telegram notification', err)
          }
        })
      }

      telegrambot()
    }
  })
})
