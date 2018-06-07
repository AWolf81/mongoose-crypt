Feature: User should transparently query encrypted values
  Scenario: The user queries a single document
    Given user queries 1 documents
    Then he should get 1 documents 
    And with decrypted values

  Scenario: The user queries multiple documents
    Given user queries 2 documents
    Then he should get 2 documents
    And with decrypted values
