# Mongoose encryption plugin
This plugin is simillar to the Mongoose-Cipher plugin but it will support encryption of nested values.

## Note
This plugin is very alpha and not everything is added yet but basic encryption and quering should work.

# Installation for development & building
Clone the repo then `yarn install` to install dependencies.

Use `yarn compile` to build the plugin.

Use `yarn test` to run the tests.

Use `yarn cover` to run coverage report.

# Todos
[x] Add find & findOne with encyption
[x] Add saving with encryption
[x] Add findOneAndUpdate
[ ] Check Mongoose update
[ ] Check Cucumber tests
[ ] Add travisci
[ ] Add coveralls
[ ] Create example
[ ] Test plugin in a real app
[ ] Publish to npm after first release
