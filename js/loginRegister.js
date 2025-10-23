// ----------------- Enhanced Login System with PIN Authentication -----------------

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing login system...");
    
    // Initialize login tabs switching
    const tabs = document.querySelectorAll('.tab-button');
    const loginSections = document.querySelectorAll('.login-section');

    console.log("Tabs found:", tabs.length);
    console.log("Login sections found:", loginSections.length);

    function switchLoginTab(tabId) {
        console.log("Switching to tab:", tabId);
        tabs.forEach(tab => tab.classList.remove('active'));
        loginSections.forEach(section => section.classList.remove('active'));
        
        // Activate selected tab
        const tabElement = document.getElementById(tabId);
        const sectionId = tabId.replace('-tab', '-login');
        const sectionElement = document.getElementById(sectionId);
        
        if (tabElement) tabElement.classList.add('active');
        if (sectionElement) sectionElement.classList.add('active');
    }

    // Tab switching
    const employeeTab = document.getElementById("employee-tab");
    const adminTab = document.getElementById("admin-tab");

    console.log("Employee tab element:", employeeTab);
    console.log("Admin tab element:", adminTab);

    if (employeeTab) {
        employeeTab.addEventListener("click", () => {
            console.log("Employee tab clicked");
            switchLoginTab("employee-tab");
        });
    } else {
        console.error("Employee tab not found!");
    }

    if (adminTab) {
        adminTab.addEventListener("click", () => {
            console.log("Admin tab clicked");
            switchLoginTab("admin-tab");
        });
    } else {
        console.error("Admin tab not found!");
    }
    // Employee PIN Login
    document.getElementById("employee-login-btn")?.addEventListener("click", () => {
        const employeeId = document.getElementById("employee-id")?.value.trim();
        const pin = document.getElementById("employee-pin")?.value.trim();

        if (!employeeId || !pin) {
            showToast("Please enter Employee ID and PIN", "error");
            return;
        }
        
        if (!/^\d{4,6}$/.test(pin)) {
            showToast("PIN must be 4-6 digits", "error");
            return;
        }

        authenticateUser(employeeId, pin, "employee");
    });

    // Admin Login (existing)
    const adminBtn = document.getElementById("log");
    if (adminBtn) {
        adminBtn.addEventListener("click", () => {
            console.log("Admin login button clicked"); // Debug log
            const username = document.getElementById("username-login")?.value.trim();
            const password = document.getElementById("password-login")?.value.trim();

            if (!username || !password) {
                showToast("Please enter both username and password", "error");
                return;
            }

            const fd = new FormData();
            fd.append("username", username);
            fd.append("password", password);

            console.log("Sending login request for username:", username); // Debug log
            
            // Use login.php instead of login_check.php for consistency
            fetch("db/login.php", { 
                method: "POST", 
                body: fd,
                cache: "no-cache"
            })
                .then(r => {
                    console.log("Response status:", r.status); // Debug log
                    return r.json();
                })
                .then(res => {
                    console.log("Login response:", res); // Debug log
                    if (res.status === "success") {
                        showToast("Login successful!", "success");
                        if (res.role === "admin") {
                            // Add a small delay to ensure session is established
                            setTimeout(() => {
                                console.log("Redirecting to admin dashboard...");
                                window.location.href = "index.php";
                            }, 500);
                        }
                    } else {
                        showToast("Admin login failed: " + (res.message || "Unknown error"), "error");
                    }
                })
                .catch(err => {
                    console.error("Login error", err);
                    showToast("Server error: " + err.message, "error");
                });
        });
    } else {
        console.error("Admin login button not found!");
    }

    // Enter key support for PIN fields
    document.getElementById("employee-pin")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") document.getElementById("employee-login-btn").click();
    });

    // Restricted input for PIN fields
    document.getElementById("employee-pin")?.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    });
});

// PIN Authentication function
function authenticateUser(userId, pin, userType) {
    const fd = new FormData();
    fd.append("employeeId", userId);
    fd.append("pin", pin);
    fd.append("userType", userType);

    console.log("Sending PIN login request:", { userId, userType });

    fetch("db/pin_login_simple.php", { 
        method: "POST", 
        body: fd,
        cache: "no-cache"
    })
        .then(r => {
            console.log("PIN login response status:", r.status);
            return r.json();
        })
        .then(res => {
            console.log("PIN login result:", res);
            if (res.status === "success") {
                showToast("Access granted!", "success");
                
                if (res.role === "cashier") {
                    // Add a small delay to ensure session is established
                    setTimeout(() => {
                        console.log("Redirecting to cashier dashboard...");
                        window.location.href = "cashier.html";
                    }, 500);
                } else if (res.role === "admin") {
                    // Add a small delay to ensure session is established
                    setTimeout(() => {
                        console.log("Redirecting to admin dashboard...");
                        window.location.href = "index.php";
                    }, 500);
                }
            } else {
                showToast("Access denied: " + (res.message || "Invalid credentials"), "error");
            }
        })
        .catch(err => {
            console.error("PIN login error", err);
            showToast("Authentication error, please try again.", "error");
        });
}

// ----------------- Toast helper -----------------
function showToast(message, type) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  if (!toast || !toastMessage) return;

  toastMessage.innerText = message;
  toast.className = "toast";

  if (type === "success") {
    toast.classList.add("show", "toast-success");
  } else if (type === "error") {
    toast.classList.add("show", "toast-error");
  }

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}