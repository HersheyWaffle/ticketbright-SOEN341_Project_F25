Feature: Authentication and role-based access
  As a user I need to sign in and be routed based on my role

  Scenario: Attendee logs in successfully
    Given I am on the login page
    When I enter valid attendee credentials
    Then I am redirected to "/events"

  Scenario: Organizer-only area is restricted
    Given I am logged in as an attendee
    When I try to open "/organizer/dashboard"
    Then I see "Forbidden" or I am redirected to "/events"
