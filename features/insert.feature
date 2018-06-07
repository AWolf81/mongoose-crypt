Feature: Encrypt values inside MongoDB transparently
  Some values inside the database are very sensitive and require
  encryption. So they're not readable with-out the secret.
  The user can insert data and the plugin stores the data encrypted.

  Scenario: The entered value of key "Content" should be saved encrypted
    Given user enters "text to encrypt"
    When the users saves the document
    Then "content" will be encrypted in database

  Scenario: The developer doesn't have the secret and the user wants to decrypt the document
    Given user queries 1 documents
    When there is no secret
    Then it should log an error

 