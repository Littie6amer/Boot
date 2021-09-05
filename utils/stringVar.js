// varData = {
//  "firstProperty": {
//     "secondProperty": {
//         "thirdProperty": "Value"
//     }, "otherProperty": "Value"
//  }, 
//  "otherProperty": "Value"
//}

module.exports = async(str, varData) => { // Coded By Littie6amer - It took way to long
    varData = varData || {}
    let msg = str.split('/#0001../').join('<!>').split('{')
      let msgTemp = []
      for (item in msg) {
        if (msg[item].search('}') < 0) { msgTemp.push(msg[item]); } else {
          if (msg[item].split('}')[0].length) { msgTemp.push(msg[item].split('}')[0].toLowerCase()+'/#0001../'); }
          for (itm in msg[item].split('}').slice(1)) {
            let items = msg[item].split('}').slice(1);
            if (items && items[itm].length) {
              msgTemp.push(items[itm]);
            }
          }
        }
      }
  
      msg = []
      for (item in msgTemp) {
        let itm = msgTemp[item]
        let fin = false
        if (itm.endsWith('/#0001../') && itm.startsWith('\\')) {
          fin = true
          msg.push('{'+itm.slice(1, itm.length-'/#0001../'.length)+'}')
        }
  
        if (itm.endsWith('/#0001../') && !fin) {
          itm = itm.slice(0, itm.length-'/#0001../'.length)
  
          itm = itm.split('_').join('.')
          
          const args = itm.split('.')
          if (!args[1]) {fin = true}
          console.log(fin)

          const lol = propertyMatch(args, varData, 'gay')
          console.log(lol)
          if (lol !== "/#0002../" && !fin) {
              fin = true
              msg.push(lol)
              console.log(lol)
          }
          
  
          if (!fin) {
            msg.push(`{${itm}}`)
            fin = true
          }
        }
  
        if (!fin) {
          msg.push(itm)
        }
      }
      
      console.log(msg)
      return msg.join('')
  }
  
function propertyMatch (propertys, object, path) {
    let returner = '/#0002../'
    // console.log(propertys, object, path, object[propertys[0]])
    if (object[propertys[0]] != undefined && object[propertys[0]] != null) {
        if (typeof object[propertys[0]] == 'object') {
            object = object[propertys[0]]
            propertys.shift()
            if (!propertys.length) return `<<${path}>>`
            returner = propertyMatch (propertys, object, path)
        } else {
            returner = object[propertys[0]]
        }
    } else {

      return returner

    }

    return returner

}