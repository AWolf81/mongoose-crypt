Feature: Modify encrypted values
    A user wants to modify data of encrypted values

    Scenario: User wants to update one object with findOneAndUpdate
        Given user uses method "findOneAndUpdate"
        And modifies "first document" 
        And wants to change from "plaintext" to "modified"
        Then "content" will be encrypted in database
        And stored value is "modified"

    # Scenario: User wants to update object with update method
    #    Given user uses method "update"
    #    And modifies "_id=1" 
    #    And wants to change from "plaintext" to "modified"
    #    Then "content" will be encrypted in database
    #    And stored value is "modified"

    