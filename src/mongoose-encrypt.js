import CryptoJS from 'crypto-js'
import dotty from 'dotty'

export default function(schema, options) {
  options.fieldsToEncrypt = options.fields || []
  const secret = options.secret

  if (secret === undefined) {
    throw new Error('Secret required! Please pass a secret as option.') // todo: check if this.error() is available here
  }

  function encrypt(text) {
    return CryptoJS.AES.encrypt(text, secret)
  }

  function decrypt(text) {
    const bytes = CryptoJS.AES.decrypt(text, secret)
    //// console.log('decrypt', text, bytes.toString(CryptoJS.enc.Utf8), bytes)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  function checkQuery(key) {
    if (options.fieldsToEncrypt.indexOf(key) !== -1) {
      throw new Error(
        'Querying an encrypted field not supported. Please query with not encrypted fields or query all and filter manually.'
      )
    }
    return
  }

  schema.pre('save', function(next) {
    for (let field of options.fieldsToEncrypt) {
      const ciphertext = encrypt(dotty.get(this, field))
      dotty.put(this, field, ciphertext.toString())
    }
    next()
  })

  schema.pre('find', function(next, done) {
    const query = this.getQuery()
    const keys = Object.keys(query)
    // check if query contains encrypted fields
    try {
      for (const key of keys) {
        checkQuery(key)
      }
      next() // no error thrown go to next middleware
    } catch (err) {
      done(err) // error thrown exit find and return error
    }
  })

  schema.pre('findOneAndUpdate', function(next) {
    // todo refactor for loop from pre save & findOneAndUpdate
    for (let field of options.fieldsToEncrypt) {
      const ciphertext = encrypt(dotty.get(this._update, field))
      dotty.put(this._update, field, ciphertext.toString())
    }
    next()
  })

  schema.pre('update', function(next) {
    let updateObj = this.getUpdate()
    for (let field of options.fieldsToEncrypt) {
      const val = dotty.get(this._update, field)
      if (val) {
        const ciphertext = encrypt(val)
        dotty.put(updateObj, field, ciphertext.toString())
      }
    }
    this._update = updateObj
    next()
  })

  schema.post('find', async function(docs, next) {
    try {
      //// console.log('find in pos', docs)
      for (let doc of docs) {
        //// console.log('found', doc)
        for (let field of options.fieldsToEncrypt) {
          const encryptedText = dotty.get(doc, field)
          dotty.put(doc, field, decrypt(encryptedText))
          //// console.log('find', encryptedText, dotty.get(doc, field))
        }
      }

      next()
    } catch (err) {
      throw err
    }
  })

  schema.post('findOne', function(doc, next) {
    for (let field of options.fieldsToEncrypt) {
      // console.log('find one', doc, dotty.get(doc, field))
      dotty.put(doc, field, decrypt(dotty.get(doc, field)))
    }
    next()
  })
}
