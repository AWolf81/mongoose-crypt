const { Before, BeforeAll, AfterAll } = require('cucumber')
const dbURI = 'mongodb://localhost:27017/mongoose-encrypt'
const mongoose = require('mongoose')
const encrypt = require('../../src/mongoose-encrypt').default

const encryptedFields = ['content']
let TestSchema = mongoose.Schema({ _id: String, content: String, tag: String })
TestSchema.plugin(encrypt, { fields: encryptedFields, secret: 'mysecret-key' })
const Test = mongoose.model('test', TestSchema)
const plainText = 'plaintext'
let testModel

BeforeAll(async () => {
  await mongoose.connect(dbURI)
})

Before(async () => {
  mongoose.connection.dropDatabase()
  testModel = new Test({ _id: 0, content: plainText, tag: 'Javascript' })
  await testModel.save()

  const testModel2 = new Test({ _id: 1, content: plainText, tag: 'Javascript' })
  await testModel2.save() // save twice

  const testModel3 = new Test({ _id: 2, content: plainText, tag: 'Java' })
  await testModel3.save() // save twice
})

AfterAll(async () => {
  // runs after all scenarios
  // await mongoose.connection.dropDatabase() // comment this if you want to see the documents in mongo shell
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected')
  })
})

module.exports = {
  Test,
  TestSchema,
  constants: {
    plainText,
    encryptedFields
  }
}
