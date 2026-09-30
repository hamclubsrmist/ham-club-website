// ==========================================
// HAM CLUB WEBSITE - API CONNECTION
// ==========================================

const API_BASE_URL = "https://ham-club-backend.onrender.com/api";


// ==========================================
// LOAD EVENTS
// ==========================================

async function loadEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);

        const data = await response.json();

        if (!data.success) {
            console.error("Failed to load events:", data.message);
            return;
        }

        console.log("✅ Events loaded:", data.events);

        const eventGrid = document.querySelector(".event-grid");

        if (!eventGrid) {
            console.log("Event grid not found on this page.");
            return;
        }

        // Clear existing hard-coded events
        eventGrid.innerHTML = "";

        if (data.events.length === 0) {
            eventGrid.innerHTML = `
                <div class="no-events">
                    <p>No events available.</p>
                </div>
            `;
            return;
        }

        data.events.forEach(event => {

            const eventDate = new Date(event.date);

            const formattedDate = eventDate.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

            const card = document.createElement("div");

            card.className = "event-card";

            card.innerHTML = `
                ${
                    event.image
                        ? `<img src="https://ham-club-backend.onrender.com${event.image}" alt="${event.title}">`
                        : ""
                }

                <span class="event-date">
                    ${formattedDate}
                </span>

                <h3>${event.title}</h3>

                <p>${event.description}</p>

                ${
                    event.location
                        ? `<p class="event-location">${event.location}</p>`
                        : ""
                }

                <a href="events.html">
                    Explore Event
                </a>
            `;

            eventGrid.appendChild(card);
        });

    } catch (error) {

        console.error("❌ Error loading events:", error);

    }
}


// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
});
// ==========================================
// CONTACT FORM
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const formData = new FormData(contactForm);

        const contactData = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            subject: formData.get("subject"),
            message: formData.get("message")
        };

        try {

            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(contactData)
            });

            const data = await response.json();

            if (data.success) {

                alert("Message sent successfully! ❤️");

                contactForm.reset();

            } else {

                alert(data.message || "Failed to send message.");

            }

        } catch (error) {

            console.error("❌ Contact form error:", error);

            alert("Unable to send message. Please try again.");

        }

    });

}