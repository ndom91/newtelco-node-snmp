#!/usr/bin/node

const snmp = require('snmp-native')

const session = new snmp.Session({ host: '192.168.11.223', community: 'n3wt3lco' })

// /usr/bin/snmpwalk -t '1' -r '3' -v2c -c n3wt3lco -Pud -OQUsn -M /mnt/data/observium/mibs/rfc:/mnt/data/observium/mibs/net-snmp 'udp':'192.168.11.223':'161' .1.3.6.1.4.1.17095.6

// const oid = '1.1.3.6.1.4.1.17095.6.1.0'
// const oids = ['1.1.3.6.1.4.1.17095.6.2.0', '1.1.3.6.1.4.1.17095.6.1.0']

session.getSubtree({ oid: [1, 3, 6, 1, 4, 1, 17095, 6] }, function (error, varbinds) {
  if (error) {
    console.log('Fail :(')
  } else {
    varbinds.forEach(function (vb) {
      console.log(vb.oid + ' = ' + vb.value + ' (' + vb.type + ')')
    })
  }
  session.close()
})
