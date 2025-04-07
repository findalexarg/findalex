// File handling functionality
import { launchGamePopup } from './gamePopup.js';

// Export verification and email functions
export function verifyAndLaunchGame(files) {
  // Check if any files were uploaded
  if (files.length === 0) {
    alert('Please select at least one file to upload');
    return;
  }

  // Verify file types (images, documents, etc.)
  const validFileTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'audio/mpeg'
  ];

  let hasValidFile = false;
  let hasImportantFile = false;
  let fileTypeMessage = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Log the file type for debugging
    console.log("Verifying file type:", file.type);

    if (validFileTypes.includes(file.type)) {
      hasValidFile = true;
    }

    // Check if the important file is included
    if (file.name === "logfile1.txt" && "Charter.pdf") {
      hasImportantFile = true;
      console.log("Critical evidence file found");
    }
  }

  if (!hasValidFile) {
    alert('Please upload valid evidence files (images, PDFs, or documents)');
    return;
  }

  if (!hasImportantFile) {
    // Show a different message if the important file is missing
    alert('Missing critical evidence. Your submission is incomplete.');
    return;
  }

  // If we reach here, we have valid files including the important file - launch the game
  console.log('Verification successful:', fileTypeMessage);
  launchGamePopup(fileTypeMessage);
}

// Email trigger function
export function triggerFinalUploadEmail() {
  var playerId = localStorage.getItem("argPlayerId");
  var email = localStorage.getItem("playerEmail");

  var params = "";
  if (playerId) {
    params = "pid=" + encodeURIComponent(playerId);
  } else if (email) {
    params = "email=" + encodeURIComponent(email);
  } else {
    console.error("No player info found in localStorage!");
    return;
  }

  var scriptURL = "https://script.google.com/macros/s/AKfycbyf1ApsCNdUv_-NMI5Tc1ljuMldxmil0ZkvnF7vpt-KOgIqExhow36xzVNYGL7q6COJaA/exec";
  var url = scriptURL + "?" + params + "&trigger=finalUpload&source=upload";

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("Final email triggered:", data);
    })
    .catch(error => {
      console.error("Error triggering final email:", error);
    });
}

// Function to show reload content button
function showReloadContentButton(verificationCode) {
  const selectedFilesDiv = document.getElementById('selectedFiles');
  if (selectedFilesDiv) {
    selectedFilesDiv.innerHTML = `
      <div class="evidence-verified success">
        <h3>SYSTEM SECURITY BREACHED</h3>
        <p>Security challenges completed successfully.</p>
        <p>Verification Code: <strong>${verificationCode}</strong></p>
        <button class="reload-btn" onclick="redirectToVault('${verificationCode}')">RELOAD CONTENT</button>
      </div>
    `;

    // Add the necessary styling
    const style = document.createElement('style');
    style.textContent = `
      .evidence-verified.success {
        background-color: rgba(0, 30, 0, 0.8);
        border: 2px solid #0f0;
        padding: 20px;
        color: #0f0;
        text-align: center;
        margin-top: 20px;
        box-shadow: 0 0 15px #0f0;
        animation: glow 2s infinite alternate;
      }
      
      @keyframes glow {
        from {
          box-shadow: 0 0 10px #0f0;
        }
        to {
          box-shadow: 0 0 20px #0f0, 0 0 30px #0f0;
        }
      }

      .reload-btn {
        background-color: #0f0;
        color: #000;
        border: none;
        padding: 10px 20px;
        margin-top: 15px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      }

      .reload-btn:hover {
        background-color: #fff;
        box-shadow: 0 0 15px #fff;
      }
    `;
    document.head.appendChild(style);

    // Add the redirect function to the global scope
    window.redirectToVault = function (code) {
      // Store the code in localStorage to be used by vault.html
      localStorage.setItem('vaultAccessCode', code);
      // Redirect to vault.html
      window.location.href = 'vault.html';
    };
  }
}

// Initialize file handling functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById('fileInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');

  // Check if we already have a verification code from a completed game
  const savedCode = localStorage.getItem('verificationCode');
  if (savedCode) {
    showReloadContentButton(savedCode);
  }

  // Listen for the game completed event
  document.addEventListener('gamesCompleted', function (event) {
    const verificationCode = event.detail.verificationCode;
    console.log("Games completed with verification code:", verificationCode);
    showReloadContentButton(verificationCode);
  });

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      // Display selected files
      selectedFilesDiv.innerHTML = '';

      if (this.files.length > 0) {
        const fileList = document.createElement('ul');
        fileList.className = 'file-list';

        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i];
          const listItem = document.createElement('li');
          listItem.textContent = file.name;
          fileList.appendChild(listItem);
        }

        selectedFilesDiv.appendChild(fileList);

        // Add submit button if files are selected
        const submitBtn = document.createElement('button');
        submitBtn.className = 'submit-button';
        submitBtn.textContent = 'Submit Evidence';
        submitBtn.addEventListener('click', function () {
          handleFileSubmission(fileInput.files);
        });
        selectedFilesDiv.appendChild(submitBtn);
      }
    });
  }

  function handleFileSubmission(files) {
    // Check if the important file is included before showing success message
    let hasImportantFile = false;

    for (let i = 0; i < files.length; i++) {
      if (files[i].name === "importantfile.pdf") {
        hasImportantFile = true;
        break;
      }
    }

    if (!hasImportantFile) {
      // Show an error message if the important file is missing
      selectedFilesDiv.innerHTML = `
        <div class="evidence-error">
          <h3>CRITICAL EVIDENCE MISSING</h3>
          <p>Your submission is incomplete. Key evidence file not found.</p>
          <p>Try again with the required evidence file.</p>
        </div>`;

      // Add styling for the error message
      const errorStyle = document.createElement('style');
      errorStyle.textContent = `
        .evidence-error {
          background-color: rgba(30, 0, 0, 0.8);
          border: 2px solid #f00;
          padding: 20px;
          color: #f00;
          text-align: center;
          margin-top: 20px;
          box-shadow: 0 0 15px #f00;
          animation: error-glow 2s infinite alternate;
        }
        
        @keyframes error-glow {
          from {
            box-shadow: 0 0 10px #f00;
          }
          to {
            box-shadow: 0 0 20px #f00, 0 0 30px #f00;
          }
        }
      `;
      document.head.appendChild(errorStyle);

      return; // Exit the function
    }

    // If we get here, the important file was included
    selectedFilesDiv.innerHTML = '<div class="evidence-verified"><h3>Evidence Received</h3><p>Thank you for your submission. Your evidence is being processed.</p></div>';

    // Verify files and launch the game popup
    verifyAndLaunchGame(files);

    // Trigger email notification
    triggerFinalUploadEmail();
  }
});
