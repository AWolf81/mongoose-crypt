Feature: User should transparently query encrypted values
  Scenario: The user queries a single document
    Given user queries 1 documents
    Then he should get 1 documents 
    And with decrypted values

  Scenario: The user queries multiple documents
    Given user queries 3 documents
    Then he should get 3 documents
    And with decrypted values

#   Scenario: The user wants to query encrypted fields
#     # Comment: Would be great to have but difficult to implement (removed steps commit hash with not working impl. hash fe48c9e)
#     Given user queries documents by key "username" with value "John"
#     Then he should get 2 documents
#     And with decrypted values

  Scenario: The user gets an error if querying an encrypted field
    Quering of encrypted fields not supported yet. (This can be removed if the commented Scenario could be implemented.)
    Given user queries documents by key "content" with value "plaintext"
    And the field "content" is encrypted
    Then it should log an error with message "Querying an encrypted field not supported. Please query with not encrypted fields or query all and filter manually."

  Scenario: The user querys for a not encrypted field
    Quering not encrypted fields should work with-out problems
    Given user queries documents by key "tag" with value "Javascript"
    And the field "tag" is not encrypted
    Then he should get 2 documents
    And with decrypted values
