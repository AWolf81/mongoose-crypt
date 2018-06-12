const mongoose = require('mongoose')
const encrypt = require('../lib/mongoose-encrypt').default

const mongoURL = 'mongodb://localhost:27017/mongoose-encrypt-example'

const UserSchema = mongoose.Schema({ username: String, email: String })
UserSchema.plugin(encrypt, { fields: ['username', 'email'], secret: 'mysecret-key' })

const User = mongoose.model('user', UserSchema)

async function init() {
  // connect to mongodb
  mongoose.connect(mongoURL) // no need to wait for connection as mongoose will queue everything for us

  const users = await User.find().exec()

  if (users.length === 0) {
    // no users in db --> create two users
    const john = new User({ username: 'John', email: 'John@dummy.com' })
    const jane = new User({ username: 'Jane', email: 'Jane@dummy.com' })

    // return a promise for both saved users
    return Promise.all([john.save(), jane.save()])
  } else {
    // already seeded
    return Promise.resolve(users)
  }
}

function log() {
  // logging method to add a line after each console.log
  console.log.apply(null, arguments)
  console.log('---------------------------------------------------')
}

init()
  .then(function(users) {
    log('init done', users)
  }) // first init (created db connection and seeds db if req.)
  .then(async function() {
    try {
      // query users
      const users = await User.find()
      log('users (decrypted)')
      log(users)

      // query db to see the encryption
      const encryptedUsers = await User.collection.find().toArray()
      log('Print encrypted users:')
      log(encryptedUsers)

      process.exit(0)
    } catch (err) {
      console.error('query failed', err)
      process.exit(1)
    }
  })
  .catch(function(err) {
    console.error('init failed', err)
    process.exit(1)
  })
