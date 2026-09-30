// ==========================================
// HAM CLUB ADMIN LOGIN
// ==========================================

const API_BASE_URL = "https://ham-club-backend.onrender.com/api";

const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");

const loginButton = document.getElementById("loginButton");


if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;


        loginMessage.textContent = "";

        loginButton.disabled = true;

        loginButton.textContent = "Logging in...";


        try {

            const response = await fetch(`${API_BASE_URL}/auth/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });


            const data = await response.json();


            if (!response.ok || !data.success) {

                loginMessage.textContent =
                    data.message || "Invalid email or password.";

                loginMessage.style.color = "red";

                loginButton.disabled = false;

                loginButton.textContent = "Login to Dashboard";

                return;
            }


            // Save JWT token
            localStorage.setItem("hamClubToken", data.token);


            // Save admin information if provided
            if (data.user) {

                localStorage.setItem(
                    "hamClubAdmin",
                    JSON.stringify(data.user)
                );

            }


            loginMessage.textContent =
                "Login successful! Redirecting...";

            loginMessage.style.color = "green";


            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 700);


        } catch (error) {

            console.error("❌ Login error:", error);

            loginMessage.textContent =
                "Unable to connect to the server.";

            loginMessage.style.color = "red";

            loginButton.disabled = false;

            loginButton.textContent = "Login to Dashboard";

        }

    });

}