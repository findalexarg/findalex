// Email Sign-Up Form Submission Handler
document.addEventListener("DOMContentLoaded", function () {
  // Email Sign-Up Form Submission
  const emailForm = document.getElementById("emailForm");
  if (emailForm) {
    emailForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent form from reloading the page

      // Grab the entered email
      let email = document.getElementById("playerEmail").value;
      if (email == "alexleighton97@gmail.com") {
        return;
      }
      // Google Apps Script URL (update with your deployed web app URL)
      let scriptURL = "https://script.google.com/macros/s/AKfycbyf1ApsCNdUv_-NMI5Tc1ljuMldxmil0ZkvnF7vpt-KOgIqExhow36xzVNYGL7q6COJaA/exec";

      // Show loading message
      document.getElementById("emailForm").innerHTML = `<p>Joining the search, please wait...</p>`;


      // The trigger parameter here is set to "findAlex" to match your Apps Script
      fetch(scriptURL + "?email=" + encodeURIComponent(email) + "&trigger=findAlex")
        .then(response => response.json())
        .catch(error => {
          console.log("Falling back to no-cors mode");
          return fetch(scriptURL + "?email=" + encodeURIComponent(email) + "&trigger=findAlex", {
            mode: "no-cors"
          }).then(() => {
            return {};
          });
        })
        .then(data => {
          let playerId = data.playerId;

          // Store playerId or fallback to email if not provided
          if (playerId) {
            localStorage.setItem("argPlayerId", playerId);
          } else {
            console.log("No player ID returned, using email as backup identifier");
            localStorage.setItem("playerEmail", email);
          }

          document.getElementById("emailForm").innerHTML = `<p>PLEASE CHECK YOUR EMAIL FOR CORRESPONDENCE! IT MAY BE IN YOUR SPAM FOLDER!</p>`;
        })
        .catch(error => {
          console.error("Error:", error);
          document.getElementById("emailForm").innerHTML = `<p>PLEASE CHECK YOUR EMAIL FOR CORRESPONDENCE! IT MAY BE IN YOUR SPAM FOLDER!</p>`;
        });
    }); // Close emailForm submit event listener
  }
}); // Close DOMContentLoaded event listener