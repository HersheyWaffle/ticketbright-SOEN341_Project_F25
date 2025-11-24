Feature: QR validation at entrance
  Scenario: First scan admits attendee
    Given order status is "PAID" and qrCode "XYZ"
    When staff scans "XYZ"
    Then ticket becomes "USED" and entry is allowed

  Scenario: Reuse is rejected
    Given ticket "XYZ" is already "USED"
    When staff scans "XYZ" again
    Then I see "Ticket already used"
