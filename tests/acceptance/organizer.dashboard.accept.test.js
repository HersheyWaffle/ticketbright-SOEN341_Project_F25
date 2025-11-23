test("Organizer sees updated remaining capacity after tickets are purchased", async () => {
  // 1) Organizer creates event
  const createRes = await request(app)
    .post("/api/events")
    .send({
      title: "Career Fair",
      description: "Company booths + networking",
      date: "2025-10-01T10:00:00.000Z",
      location: "Main Hall",
      capacity: 5,
      ticketType: "FREE",
      organizerId: "org-123",
    });

  expect(createRes.status).toBe(201);
  const event = createRes.body;

  // 2) Some students claim tickets
  await request(app).post("/api/tickets/purchase").send({
    eventId: event.id,
    studentId: "s1",
  });

  await request(app).post("/api/tickets/purchase").send({
    eventId: event.id,
    studentId: "s2",
  });

  // 3) Organizer goes to dashboard
  const dashRes = await request(app)
    .get(`/api/organizers/${event.organizerId}/dashboard`)
    .query({ eventId: event.id }); // or however your dashboard API works

  expect(dashRes.status).toBe(200);
  expect(dashRes.body).toHaveProperty("events");

  const dashEvent = dashRes.body.events.find((e) => e.id === event.id);

  expect(dashEvent).toBeDefined();
  expect(dashEvent.capacity).toBe(5);
  expect(dashEvent.ticketsSold).toBe(2);
  expect(dashEvent.remainingCapacity).toBe(3);
});
