Feature: Ticket purchase
  Scenario: Successful single-ticket purchase
    Given an event with capacity > 0
    And I am logged in as "attendee"
    When I purchase 1 ticket
    Then I receive an orderId and QR code
    And remaining capacity decreases by 1
