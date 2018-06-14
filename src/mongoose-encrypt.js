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

  schema.pre('save', function(next) {
    for (let field of options.fieldsToEncrypt) {
      const ciphertext = encrypt(dotty.get(this, field))
      dotty.put(this, field, ciphertext.toString())
    }
    next()
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
    //// console.log('before update', this._update)
    for (let field of options.fieldsToEncrypt) {
      const ciphertext = encrypt(dotty.get(this._update, field))
      // console.log('cipher', ciphertext.toString())
      dotty.put(this._update, field, ciphertext.toString())
    }
    next()
  })

  schema.pre('find', async function(next) {
    // console.log('pre find', this, docs)
    const query = this.getQuery()
    const keys = Object.keys(query)
    // console.log(
    //   'query ob',
    //   query,
    //   Object.keys(query).some(key => options.fieldsToEncrypt.indexOf(key) !== -1)
    // )
    if (keys.some(key => options.fieldsToEncrypt.indexOf(key) !== -1)) {
      this._storedQuery = query // save query for later usage in post find --> repeat query
      next()
      //
    }
  })

  schema.post('find', async function(docs, next) {
    try {
      //// console.log('find in pos', docs)
      if (this._storedQuery) {
        docs = await this.model.collection.find().toArray()
        console.log('query with native collection', docs)
      }

      for (let doc of docs) {
        //// console.log('found', doc)
        for (let field of options.fieldsToEncrypt) {
          const encryptedText = dotty.get(doc, field)
          dotty.put(doc, field, decrypt(encryptedText))
          console.log('find', encryptedText, dotty.get(doc, field))
        }
      }

      if (this._storedQuery) {
        docs = docs.filter(doc => {
          let skip = false
          let i = 0
          const keys = Object.keys(this._storedQuery)
          while (i < keys.length && !skip) {
            // all items checked or first positive match
            const key = keys[i]
            skip = doc[key] === this._storedQuery[key]
            i++
          }

          return skip
        })
      }

      console.log('found', docs, this)
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
