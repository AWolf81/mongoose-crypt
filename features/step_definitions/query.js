const assert = require('assert')
const mongoose = require('mongoose')
const { Given, When, Then, Before, After } = require('cucumber')
const { Test, constants } = require('./init_db')
const encrypt = require('../../src/mongoose-encipher').default
const { isDecrypted, isEncrypted } = require('../helpers')

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

// When('I query the field with secret', async function() {
//   this.doc = await Test.findOne()
//   this.actualAnswer = this.doc.content
// })

Given('the field {string} is using select=false', async function(unselected) {
  const selection = {}
  selection[unselected] = 0

  this.docs = await Test.find({}, selection).exec()
})

Given('the Schema defaults is using {string} {string} as select', async function(
  prop,
  selectState
) {
  let schema = {
    _id: String,
    content: String,
    tag: String
  }

  schema[prop] = {
    type: String,
    select: selectState === 'true'
  }

  let TestSchemaSelect = mongoose.Schema(schema)
  const Test = mongoose.model('Test', TestSchemaSelect)

  this.docs = await Test.find({}).exec()
})

Then('with-out key {string}', function(expected) {
  //// console.log('not containing', expected, this.docs, !this.docs.every(doc => !!doc[expected]))
  assert.ok(!this.docs.every(doc => !!doc[expected]))
})

Then('with decrypted values', function() {
  const everyValueDecrypted = Array.isArray(this.docs)
    ? this.docs.every(doc => isDecrypted(doc))
    : isDecrypted(this.docs)
  assert.ok(everyValueDecrypted)
})

Then('the field is {string} in database', function(expectedAnswer) {
  assert.equal(this.actualAnswer, expectedAnswer)
})

Then('he should get {int} documents', function(count) {
  let docCount = this.docs ? 1 : 0

  if (Array.isArray(this.docs)) {
    docCount = this.docs.length
  }

  assert.equal(docCount, count)
})
