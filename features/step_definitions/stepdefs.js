const assert = require('assert')
const { Given, When, Then, Before, After } = require('cucumber')
const dbURI = 'mongodb://localhost:27017/mongoose-encrypt'
const mongoose = require('mongoose')
const encrypt = require('../../src/mongoose-encrypt').default

// console.log('encrypt', encrypt)
const encryptedFields = ['content']
let TestSchema = mongoose.Schema({ _id: String, content: String })
TestSchema.plugin(encrypt, { fields: encryptedFields, secret: 'mysecret-key' })
const Test = mongoose.model('test', TestSchema)
const plainText = 'plaintext'
let testModel

Before(async () => {
  await mongoose.connect(dbURI)
  mongoose.connection.dropDatabase()
  testModel = new Test({ _id: 0, content: plainText })
  await testModel.save()

  const testModel2 = new Test({ _id: 1, content: plainText })
  await testModel2.save() // save twice

  const testModel3 = new Test({ _id: 2, content: plainText })
  await testModel3.save() // save twice
})

After(async () => {
  // runs after each scenario
  //   conn.dropDatabase() // later drop db
  // testing ------
  // const docs = await Test.find()
  // console.log('after test', docs)
})

function isEncrypted(doc, key) {
  key = key || 'content'
  return doc[key] !== plainText
}

function isDecrypted(doc, key) {
  key = key || 'content'
  return doc[key] === plainText
}

Given('user queries {int} documents', async function(count) {
  this.docs = count === 1 ? await Test.findOne() : await Test.find()
})

Given('user queries documents by key {string} with value {string}', async function(key, value) {
  // Write code here that turns the phrase above into concrete actions
  // console.log('get docs for query', key, value)
  let query = {}
  query[key] = value

  // console.log(query)
  try {
    this.docs = await Test.find(query)
  } catch (err) {
    this.errorThrown = err
  }
})

Then('he should get {int} documents', function(count) {
  let docCount = this.docs ? 1 : 0

  if (Array.isArray(this.docs)) {
    docCount = this.docs.length
  }

  assert.equal(docCount, count)
})

// When('I query the field with secret', async function() {
//   this.doc = await Test.findOne()
//   this.actualAnswer = this.doc.content
// })

Then('with decrypted values', function() {
  const everyValueDecrypted = Array.isArray(this.docs)
    ? this.docs.every(doc => isDecrypted(doc))
    : isDecrypted(this.docs)
  assert.ok(everyValueDecrypted)
})

Then('the field is {string} in database', function(expectedAnswer) {
  assert.equal(this.actualAnswer, expectedAnswer)
})

Given('User enters {string}', function(textToEncrypt) {
  this.model = new Test({ _id: mongoose.Types.ObjectId(), content: textToEncrypt })
})

When('the users saves the document', function() {
  return this.model.save()
})

When('there is no secret', async function() {
  let TestSchemaPlain = mongoose.Schema({ content: String })
  try {
    TestSchemaPlain.plugin(encrypt, {
      fields: ['content']
    })
  } catch (err) {
    this.errorThrown = err
  }
})

Given('the field {string} is encrypted', function(key) {
  this.isEncryptedField = encryptedFields.indexOf(key) !== -1
})

Then('it should log an error with message {string}', function(message) {
  // Write code here that turns the phrase above into concrete actions
  assert.deepEqual(this.errorThrown, new Error(message))
})

Then('{string} will be encrypted in database', async function(key) {
  this.encrypted = await Test.collection.findOne({ _id: this.model._id })
  assert.ok(isEncrypted(this.encrypted, key))
})

Given('user enters {string}', function(text) {
  this.model = new Test({ _id: mongoose.Types.ObjectId(), content: text })
})

// findOneAndUpdate
Given(
  'user uses method {string}', // to modify first document from {string} to {string}',
  function(method) {
    // Write code here that turns the phrase above into concrete actions
    this.method = method
  }
)

Given('modifies {string}', function(query) {
  this.query = query
})

Given('wants to change from {string} to {string}', async function(org, modification) {
  let doc
  if (this.query == 'first document') {
    // it's more an action and should be in when
    doc = await Test[this.method]({}, { content: modification }).exec() // findOneAndUpdate for first element
    // console.log('given', doc) // query
  } else {
    const splitted = this.query.split('=')
    const key = splitted[0]
    const val = splitted[1]
    // console.log('query key', key, val)
    // console.log('method', this.method)
    const res = await Test[this.method]({ key: val }, { content: modification }).exec() // update by id
    doc = await Test.findOne({ _id: val }).exec()
    // console.log('update', doc, res)
  }
  this.model = doc // todo --> use same object!!
  this.docs = doc
})
Then('stored value is {string}', async function(expectedAnswer) {
  const doc = await Test.findOne({ _id: this.docs._id })
  // console.log('found stored', doc, this.docs)
  assert.equal(doc.content, expectedAnswer)
})
