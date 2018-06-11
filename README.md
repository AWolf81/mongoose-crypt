[![Travis Status](https://img.shields.io/travis/AWolf81/mongoose-encrypt/devel.svg?label=Travis%20bulid)](https://travis-ci.org/AWolf81/mongoose-encrypt)

# Mongoose encryption plugin
This plugin is simillar to the Mongoose-Cipher plugin but it will support encryption of nested values.

It will store values in database with symetrical encryption and uses Crypto-js.

## Note
This plugin is very alpha and not everything is added yet but basic encryption and quering should work.

## Why another encryption plugin?
Because the other available plugins are not working for me. Seems like there are some issues related to Mongoose v5.

At mongoose-encryption there is a [PR](https://github.com/joegoldbeck/mongoose-encryption/pull/71) trying to fix a problem related to Mongoose 5 but the PR is still open and I couldn't find a fix there - many failing unit tests. Also tests are failing with-out change from the PR.

[mongoose-cipher](https://github.com/estrada9166/mongoose-cipher) wasn't working for my use-case - encryption of a nested schema. e.g. { content: '...', user: {username: 'encrypted}}

## Usage
### Basic example

    const UserSchema = mongoose.Schema({ username: String, email: String })
    UserSchema.plugin(encrypt, { fields: ['username', 'email'], secret: 'mysecret-key' })
    
    const User = mongoose.model('user', UserSchema)
    const john = new User({username: 'John', email: 'John@dummy.com'})
    john.save()

This will create data simillar to the following for user `john`.

    {
        _id: ObjectId("5b1a215481c9235d60a02d22"),
        username: "U2FsdGVkX1+pCWDTtFvysJrjskUsAIRqlXOepFPpnvM=",
        email: "U2FsdGVkX1/PbGWvQQvm6zVSeOWeLFQzCRgr40g3oyg=",
        __v: NumberInt(0)
    }
    
Quering as usual with `User.find()` or `User.findOne()` the plugin will decrypt all encrypted fields and returns a readable document.
    
Updating with `findOneAndUpdate` is supported.
    
# Installation for development & building
Clone the repo then `yarn install` to install dependencies.

Use `yarn compile` to build the plugin.

Use `yarn test` to run the tests.

Use `yarn cover` to run coverage report.

# Security notes
- Keep a copy of the secret in a save place locally. If you're loosing the key the data can't be decrypted anymore.
- Store your secret for encryption in a save place e.g. environment variable of your hoster and use it with `process.env`
- If someone compromises your backend login to your hoster it's possible to decrypt all data
- Never decrypt client side - if you're creating a serverless app consider using AWS lambdas to get the data.

# License

## The MIT License

Copyright (c) 2018 Alexander Wolf

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

