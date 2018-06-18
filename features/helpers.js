const { constants } = require('./step_definitions/init_db')

function isEncrypted(doc, key, text) {
  key = key || 'content'
  text = text || constants.plainText
  return doc[key] !== text
}

function isDecrypted(doc, key, text) {
  key = key || 'content'
  text = text || constants.plainText
  return doc[key] === text
}

module.exports = {
  isEncrypted,
  isDecrypted
}
