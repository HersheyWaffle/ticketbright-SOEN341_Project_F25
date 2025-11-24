Feature: Export attendees as CSV
  Scenario: Organizer downloads CSV
    Given I am logged in as "organizer"
    And event "E1" has attendees
    When I GET /api/events/E1/attendees/export
    Then I receive text/csv with headers name,email,orderId,checkedIn
