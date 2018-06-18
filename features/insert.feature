Feature: Encrypt values inside MongoDB transparently
  Some values inside the database are very sensitive and require
  encryption. So they're not readable with-out the secret.
  The user can insert data and the plugin stores the data encrypted.

  Scenario: The entered value of key "Content" should be saved encrypted
    Given user enters "text to encrypt"
    When the user saves the document
    Then "content" will be encrypted in database

  Scenario: The developer doesn't have the secret and the user wants to decrypt the document
    Given user queries 1 documents
    When there is no secret
    Then it should log an error with message "Secret required! Please pass a secret as option."

  Scenario: The user should be able to use method "create" for object creation
    Given user creates a document with "text to encrypt"
    Then "content" will be encrypted in database

  Scenario: Populate subdocuments that are encrypted
    Given user creates a subdocument that is encrypted
    When the users queries and populates the document
    Then subdocument should be decrypted and populated
    And subdocument is encrypted in database

  Scenario: Nested documents are encrypted correctly
    Given user creates a nested document that is encrypted
    When the user queries document with nested document
    Then nested document is decrypted on query
    And nested key "username" will be encrypted in database

  Scenario: Validation of encrypted fields (failing validation)
    Given user will add "Some long text..." as description with validation of max. length of twelve
    Then it should correctly validate and return an error
  
  Scenario: Validation of encrypted fields (passing validation)
    Given user will add "Short" as description with validation of max. length of twelve
    Then it should correctly validate
    And "description" will be encrypted in database with model "Validation" with "Short" as text
