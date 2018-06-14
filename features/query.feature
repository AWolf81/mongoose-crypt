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
#     # Comment: Would be great to have but difficult to implement (removed steps after next commit and add commit hash [here])
#     Given user queries documents by key "username" with value "John"
#     Then he should get 2 documents
#     And with decrypted values
