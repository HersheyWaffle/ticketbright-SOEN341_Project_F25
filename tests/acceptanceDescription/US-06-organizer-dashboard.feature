Feature: Organizer dashboard metrics
  Scenario: Returns analytics JSON for existing event
    Given an event with orders and check-ins
    When I GET /api/events/1/dashboard
    Then I receive 200 with fields eventId,ticketsIssued,attendanceRate

  Scenario: 404 for non-existing event
    When I GET /api/events/999/dashboard
    Then I receive 404
