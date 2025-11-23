Feature: Organizer creates an event
  Scenario: Create a valid event
    Given I am logged in as "organizer"
    When I submit title, date, location, capacity, and price
    Then the event is created (201)
    And it appears in GET /api/events
