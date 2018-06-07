Feature: Modify encrypted values
    A user wants to modify data of encrypted values

    Scenario: User wants to update one object with findOneAndUpdate
        Given user uses method "findOneAndUpdate" to modify first document from "plaintext" to "modified"
        Then "content" will be encrypted in database
        And stored value is "modified"

    #Scenario: User wants to update object with update
    #    Given user uses method "update" to modify from "plaintext" to "modified"
    #    Then "content" will be encrypted in database
    #    And stored value is "modified"

    