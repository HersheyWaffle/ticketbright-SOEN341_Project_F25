
/**
 * Generate and download an ICS calendar file
 * @param {Object} event - event info
 */
export async function addToCalendar(event) {
    const start = new Date(event.startsAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(event.endsAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ""}`,
      `LOCATION:${event.location || ""}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");
  
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Create a mock ticket (stored locally)
   * @param {Object} data - event + buyer info
   */
  export async function claimTicket(data) {
    const id = "TKT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const ticket = {
      ticketId: id,
      eventId: data.eventId,
      title: data.title,
      price: data.price,
      quantity: data.quantity,
      claimedAt: new Date().toISOString()
    };
  
    const stored = JSON.parse(localStorage.getItem("tickets") || "[]");
    stored.push(ticket);
    localStorage.setItem("tickets", JSON.stringify(stored));
  
    return ticket;
  }
  
  /**
   * Draw a QR code on the provided <canvas>
   * @param {HTMLCanvasElement} canvas
   * @param {Object} ticket
   */
  export async function renderTicketQR(canvas, ticket) {
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // QR-like visualization (simple, no dependency)
    const text = JSON.stringify(ticket);
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash + text.charCodeAt(i) * (i + 1)) % 100000;
    const seed = hash.toString();
  
    ctx.fillStyle = "#000";
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        const val = (seed.charCodeAt((x + y) % seed.length) + x * y) % 7;
        if (val < 3) ctx.fillRect(x * 10, y * 10, 8, 8);
      }
    }
  }
  
  /**
   * Wire the event page buttons ("Add to Calendar", "Claim Ticket")
   * @param {Object} opts - { getEvent: async () => {...} }
   */
  export async function wireEventPage({ getEvent }) {
    const modal = document.getElementById("ticketModal");
    const closeBtn = document.getElementById("closeTicketModal");
    const qrCanvas = document.getElementById("ticketQR");
    const ticketIdText = document.getElementById("ticketIdText");
  
    const btnAdd = document.querySelector('[data-action="add-to-calendar"]');
    const btnClaim = document.querySelector('[data-action="claim-ticket"]');
  
    if (btnAdd) {
      btnAdd.addEventListener("click", async () => {
        const ev = await getEvent();
        await addToCalendar(ev);
        alert("Event added to your calendar!");
      });
    }
  
    if (btnClaim) {
      btnClaim.addEventListener("click", async () => {
        const ev = await getEvent();
        const t = await claimTicket({
          eventId: ev.id,
          title: ev.title,
          price: ev.price,
          quantity: 1
        });
  
        await renderTicketQR(qrCanvas, t);
        ticketIdText.textContent = t.ticketId;
        modal.classList.add("open");
      });
    }
  
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }
  }
  