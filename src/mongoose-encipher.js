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
    // todo: should we check here if text is undefined? If it is undef -> decrypt throws TypeError Cannot read property 'salt' of undefined
    const bytes = CryptoJS.AES.decrypt(text, secret)
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
    for (let doc of docs) {
      for (let field of options.fieldsToEncrypt) {
        if (dotty.get(doc, field)) {
          //// selected
          const encryptedText = dotty.get(doc, field)
          dotty.put(doc, field, decrypt(encryptedText))
        }
      }
    }

    next()
  })

  schema.post('findOne', function(doc, next) {
    for (let field of options.fieldsToEncrypt) {
      if (dotty.get(doc, field)) {
        dotty.put(doc, field, decrypt(dotty.get(doc, field)))
      }
    }
    next()
  })
}
