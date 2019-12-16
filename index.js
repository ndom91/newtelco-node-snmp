#!/usr/bin/node

const snmp = require ("net-snmp")
const session = snmp.createSession ("192.168.11.223", "n3wt3lco");

// /usr/bin/snmpwalk -t '1' -r '3' -v2c -c n3wt3lco -Pud -OQUsn -M /mnt/data/observium/mibs/rfc:/mnt/data/observium/mibs/net-snmp 'udp':'192.168.11.223':'161' .1.3.6.1.4.1.17095.6

const oids = [".1.3.6.1.4.1.17095.6"];

session.get (oids, function (error, varbinds) {
    if (error) {
        console.error (error.toString ());
    } else {
        if (varbinds[0].type != snmp.ErrorStatus.NoSuchObject
                && varbinds[0].type != snmp.ErrorStatus.NoSuchInstance
                && varbinds[0].type != snmp.ErrorStatus.EndOfMibView) {
            var sysName = varbinds[0].value;
        } else {
            console.error (snmp.ObjectType[varbinds[0].type] + ": "
                    + varbinds[0].oid);
        }
    }

    session.close()
});

// session.get (oids, function (error, varbinds) {
//     if (error) {
//         console.error (error);
//     } else {
//         for (let i = 0; i < varbinds.length; i++)
//             if (snmp.isVarbindError (varbinds[i]))
//                 console.error (snmp.varbindError (varbinds[i]))
//             else
//                 console.log (varbinds[i].oid + " = " + varbinds[i].value);
//     }

//     // If done, close the session
//     session.close ();
// });

// session.trap (snmp.TrapType.LinkDown, function (error) {
//     if (error)
//         console.error (error);
// });