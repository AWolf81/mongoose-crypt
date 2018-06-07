const assert = require('assert')
const { Given, When, Then, Before, After } = require('cucumber')
const dbURI = 'mongodb://localhost:27017/mongoose-encrypt'
const mongoose = require('mongoose')
const encrypt = require('../../lib/mongoose-encrypt').default

// console.log('encrypt', encrypt)
let TestSchema = mongoose.Schema({ content: String })
TestSchema.plugin(encrypt, { fields: ['content'], secret: 'mysecret-key' })
const Test = mongoose.model('test', TestSchema)
const plainText = 'plaintext'
let testModel

Before(async () => {
  await mongoose.connect(dbURI)
  mongoose.connection.dropDatabase()
  testModel = new Test({ content: plainText })
  await testModel.save()

  const testModel2 = new Test({ content: plainText })
  await testModel2.save() // save twice
})

After(() => {
  // runs after each scenario
  //   conn.dropDatabase() // later drop db
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
  this.model = new Test({ content: textToEncrypt })
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

Then('it should log an error', function() {
  assert.deepEqual(this.errorThrown, new Error('Secret required! Please pass a secret as option.'))
})

Then('{string} will be encrypted in database', async function(key) {
  this.encrypted = await Test.collection.findOne({ _id: this.model._id })
  assert.ok(isEncrypted(this.encrypted, key))
})

Given('user enters {string}', function(text) {
  this.model = new Test({ content: text })
})

// findOneAndUpdate
Given(
  'user uses method {string} to modify first document from {string} to {string}',
  async function(method, orgString, modified) {
    // Write code here that turns the phrase above into concrete actions
    const doc = await Test[method]({}, { content: modified }).exec() // findOneAndUpdate for first element
    console.log('given', doc) // query
    this.model = doc // todo --> use same object!!
    this.docs = doc
  }
)

Then('stored value is {string}', async function(expectedAnswer) {
  const doc = await Test.findOne({ _id: this.docs._id })
  assert.equal(doc.content, expectedAnswer)
})
