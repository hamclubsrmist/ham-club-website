
const API_BASE_URL = "https://ham-club-backend.onrender.com/api";

// ==========================================
// NAVIGATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.getElementById("nav-links");
    const menuButton =
        document.getElementById("menu-toggle") ||
        document.getElementById("menuBtn");

    // Highlight the link matching the current page.
    const currentPage = (
        window.location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();

    document.querySelectorAll(".nav-links a").forEach(link => {
        const linkPage = (
            link.getAttribute("href") || ""
        ).split("/").pop().split("?")[0].toLowerCase();

        const isCurrentPage = linkPage === currentPage;

        link.classList.toggle("active", isCurrentPage);

        if (isCurrentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    // Open and close the mobile menu.
    if (navLinks && menuButton) {
        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", event => {
            event.stopPropagation();

            const isOpen =
                navLinks.classList.contains("active") ||
                navLinks.classList.contains("show") ||
                navLinks.classList.contains("open");

            navLinks.classList.toggle("active", !isOpen);
            navLinks.classList.toggle("show", !isOpen);
            navLinks.classList.toggle("open", !isOpen);

            menuButton.setAttribute("aria-expanded", String(!isOpen));
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active", "show", "open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", event => {
            if (
                !navLinks.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                navLinks.classList.remove("active", "show", "open");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                navLinks.classList.remove("active", "show", "open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.focus();
            }
        });
    }

    loadEvents();
});

// ==========================================
// LOAD EVENTS
// ==========================================

async function loadEvents() {
    const eventGrid = document.querySelector(".event-grid");
    if (!eventGrid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/events`);

        if (!response.ok) {
            throw new Error(`Events request failed: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.events)) {
            console.error("Failed to load events:", data.message);
            return;
        }

        eventGrid.innerHTML = "";

        if (data.events.length === 0) {
            eventGrid.innerHTML = `
                <div class="no-events">
                    <p>No events available.</p>
                </div>`;
            return;
        }

        data.events.forEach(event => {
            const card = document.createElement("article");
            card.className = "event-card";

            if (event.image) {
                const image = document.createElement("img");
                image.src = event.image.startsWith("http")
                    ? event.image
                    : `https://ham-club-backend.onrender.com${event.image}`;
                image.alt = event.title || "HAM Club event";
                image.loading = "lazy";
                card.appendChild(image);
            }

            const date = document.createElement("span");
            date.className = "event-date";

            const parsedDate = event.date ? new Date(event.date) : null;
            date.textContent =
                parsedDate && !Number.isNaN(parsedDate.getTime())
                    ? parsedDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })
                    : "";

            const title = document.createElement("h3");
            title.textContent = event.title || "HAM Club Event";

            const description = document.createElement("p");
            description.textContent = event.description || "";

            card.append(date, title, description);

            if (event.location) {
                const location = document.createElement("p");
                location.className = "event-location";
                location.textContent = event.location;
                card.appendChild(location);
            }

            const link = document.createElement("a");
            link.href = "events.html";
            link.textContent = "Explore Event";
            card.appendChild(link);

            eventGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

// ==========================================
// CONTACT FORM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", async event => {
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Failed to send message.");
                return;
            }

            alert("Message sent successfully!");
            contactForm.reset();
        } catch (error) {
            console.error("Contact form error:", error);
            alert("Unable to send message. Please try again.");
        }
    });
});
