const assert = require('assert')
const mongoose = require('mongoose')
const { Given, When, Then, Before, After } = require('cucumber')
const { Test, TestSchema, constants } = require('./init_db')
const encrypt = require('../../src/mongoose-crypt').default
const { isDecrypted, isEncrypted } = require('../helpers')

let Post, User, Nested, ValidationTest

const validationSchema = mongoose.Schema({
  description: {
    type: String,
    maxlength: 12
  }
})

validationSchema.plugin(encrypt, { fields: ['description'], secret: 'mysecret-key' })

ValidationTest = mongoose.model('Validation', validationSchema)

// step definitions for insert & modfiy features

// findOneAndUpdate or update
Given('user uses method {string}', function(method) {
  this.method = method
})

Given('modifies {string}', function(query) {
  this.query = query
})

Given('wants to change from {string} to {string}', async function(org, modification) {
  let doc
  if (this.query == 'first document') {
    doc = await Test[this.method]({}, { content: modification }).exec() // findOneAndUpdate for first element
  } else {
    const splitted = this.query.split('=')
    const key = splitted[0]
    const val = splitted[1]
    let query = {}
    query[key] = val
    const res = await Test[this.method](query, { content: modification }).exec() // update by id
    doc = await Test.findOne({ _id: val }).exec()
  }
  this.doc = doc
})

Given('User enters {string}', function(textToEncrypt) {
  this.doc = new Test({ _id: mongoose.Types.ObjectId(), content: textToEncrypt })
})

Given('user creates a document with {string}', async function(textToEncrypt) {
  this.doc = await Test.create({ _id: mongoose.Types.ObjectId(), content: textToEncrypt })
})

When('the user saves the document', function() {
  return this.doc.save()
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
  this.isEncryptedField = constants.encryptedFields.indexOf(key) !== -1
})

Given('the field {string} is not encrypted', function(key) {
  this.isEncryptedField = constants.encryptedFields.indexOf(key) === -1
})

Then('it should log an error with message {string}', function(message) {
  assert.deepEqual(this.errorThrown, new Error(message))
})

Then('{string} will be encrypted in database', async function(key) {
  this.encrypted = await Test.collection.findOne({ _id: this.doc._id })
  assert.ok(isEncrypted(this.encrypted, key))
})

Given('user enters {string}', function(text) {
  this.doc = new Test({ _id: mongoose.Types.ObjectId(), content: text })
})

Then('stored value is {string}', async function(expectedAnswer) {
  const doc = await Test.findOne({ _id: this.doc._id })
  assert.equal(doc.content, expectedAnswer)
})

Given('user creates a subdocument that is encrypted', async function() {
  // Write code here that turns the phrase above into concrete actions
  const PostSchema = mongoose.Schema({
    _id: String,
    content: String,
    author: { type: String, ref: 'User' }
  })
  const UserSchema = mongoose.Schema({ _id: String, username: String, email: String })

  PostSchema.plugin(encrypt, { fields: ['content'], secret: 'mysecret-key' })
  UserSchema.plugin(encrypt, { fields: ['username', 'email'], secret: 'mysecret-key' })

  Post = mongoose.model('Post', PostSchema)
  User = mongoose.model('User', UserSchema)

  const testUser = new User({
    _id: '0',
    username: 'John',
    email: 'dummy@test.io'
  })
  await testUser.save()

  const post = new Post({
    _id: '0',
    content: 'First post',
    author: '0'
  })
  await post.save()
})

When('the users queries and populates the document', async function() {
  // Write code here that turns the phrase above into concrete actions
  this.post = await Post.findOne()
    .populate('author')
    .exec()
})

Then('subdocument should be decrypted and populated', function() {
  assert.ok(isDecrypted(this.post.author, 'username', 'John'))
  assert.ok(isDecrypted(this.post.author, 'email', 'dummy@test.io'))
})

Then('subdocument is encrypted in database', async function() {
  const encryptedPost = await Post.collection.findOne({ _id: this.post._id })
  const encryptedAuthor = await User.collection.findOne({ _id: encryptedPost.author })

  assert.ok(isEncrypted(encryptedAuthor, 'username', 'John'))
  assert.ok(isEncrypted(encryptedAuthor, 'email', 'dummy@test.io'))
})

Given('user creates a nested document that is encrypted', async function() {
  // Write code here that turns the phrase above into concrete actions
  const nestedSchema = mongoose.Schema({
    _id: String,
    content: String,
    nested: {
      body: String,
      username: String
    }
  })

  nestedSchema.plugin(encrypt, { fields: ['content', 'nested.body'], secret: 'mysecret-key' })

  Nested = mongoose.model('Nested', nestedSchema)
  this.doc = await Nested.create({
    _id: '0',
    content: 'Dummy text',
    nested: {
      body: 'Nested body',
      username: 'John'
    }
  })
})

When('the user queries document with nested document', async function() {
  this.doc = await Nested.findOne()
})

Then('nested document is decrypted on query', function() {
  assert.ok(isDecrypted(this.doc.nested, 'body', 'Nested body'))
})

Then('nested key {string} will be encrypted in database', async function(string) {
  this.encrypted = await Nested.collection.findOne({ _id: this.doc._id })
  assert.ok(isEncrypted(this.encrypted.nested, 'body', 'Nested body'))
})

Given(
  'user will add {string} as description with validation of max. length of twelve',
  async function(description) {
    try {
      await ValidationTest.create({ description })
      this.doc = await ValidationTest.findOne()
    } catch (err) {
      this.error = err
    }
  }
)

Then('it should correctly validate and return an error', function() {
  assert.equal(this.error.name, 'ValidationError')
})

Then('it should correctly validate', function() {
  assert.ok(this.error === undefined)
})

Then('{string} will be encrypted in database with model {string} with {string} as text', function(
  key,
  model,
  text
) {
  // Write code here that turns the phrase above into concrete actions
  const Model = mongoose.model(model)

  this.encrypted = Model.collection.findOne()
  assert.ok(isEncrypted(this.encrypted, key, text))
})
