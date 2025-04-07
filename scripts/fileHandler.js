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
    if (file.name === "logfile1.txt") {
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

// Function to show reload content button with passcode prompt
function showReloadContentButton(verificationCode) {
  const selectedFilesDiv = document.getElementById('selectedFiles');
  if (selectedFilesDiv) {
    selectedFilesDiv.innerHTML = `
      <div class="evidence-verified success">
        <h3>SYSTEM SECURITY BREACHED</h3>
        <p>Security challenges completed successfully.</p>
        <p>Verification Code: <strong>${verificationCode}</strong></p>
        <button class="reload-btn" onclick="promptForPasscode('${verificationCode}')">RELOAD CONTENT</button>
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

    // Add the prompt passcode function to the global scope
    window.promptForPasscode = function (code) {
      // Create passcode prompt overlay
      const overlay = document.createElement('div');
      overlay.className = 'passcode-overlay';

      const promptBox = document.createElement('div');
      promptBox.className = 'passcode-prompt';

      const heading = document.createElement('h3');
      heading.textContent = '[SECURE ACCESS REQUIRED]';

      const inputLabel = document.createElement('p');
      inputLabel.textContent = 'Enter Passcode:';

      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'passcodeInput';
      input.placeholder = 'Enter passcode...';

      const submitBtn = document.createElement('button');
      submitBtn.textContent = 'Submit';
      submitBtn.addEventListener('click', function () {
        checkPasscode(code);
      });

      // Also allow Enter key to submit
      input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          checkPasscode(code);
        }
      });

      // Add close button to dismiss the overlay
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Cancel';
      closeBtn.style.marginLeft = '10px';
      closeBtn.addEventListener('click', function () {
        overlay.remove();
      });

      promptBox.appendChild(heading);
      promptBox.appendChild(inputLabel);
      promptBox.appendChild(input);
      promptBox.appendChild(submitBtn);
      promptBox.appendChild(closeBtn);
      overlay.appendChild(promptBox);

      document.body.appendChild(overlay);

      // Focus the input field
      setTimeout(() => input.focus(), 100);
    };

    window.checkPasscode = function (code) {
      const passcode = document.getElementById('passcodeInput').value.trim();
      const correctCode = "0xF3E-9B7C"; // Same as in vaultAccess.js

      if (passcode === correctCode || passcode === code) {
        // Store the code in localStorage to be used by vault.html
        localStorage.setItem('vaultAccessCode', code);
        // Redirect to vault.html
        window.location.href = 'vault.html';
      } else {
        alert("Invalid passcode. Please try again.");
      }
    };
  }
}

// Initialize file handling functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById('fileInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  let selectedFiles = []; // Array to store the selected files

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
      // Add new files to our collection instead of replacing
      const newFiles = Array.from(this.files);
      selectedFiles = selectedFiles.concat(newFiles);

      // Update the display
      updateFileDisplay();

      // Clear the file input so the same file can be selected again if needed
      fileInput.value = '';
    });
  }

  function updateFileDisplay() {
    // Clear the display area
    selectedFilesDiv.innerHTML = '';

    if (selectedFiles.length > 0) {
      const fileList = document.createElement('ul');
      fileList.className = 'file-list';

      selectedFiles.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'file-item';

        // Create the file name element
        const fileName = document.createElement('span');
        fileName.textContent = file.name;
        fileName.className = 'file-name';

        // Create the remove button
        const removeBtn = document.createElement('span');
        removeBtn.textContent = '×';
        removeBtn.className = 'remove-file';
        removeBtn.title = 'Remove file';
        removeBtn.addEventListener('click', function () {
          // Remove the file from our array
          selectedFiles.splice(index, 1);
          // Update the display
          updateFileDisplay();
        });

        // Append elements to the list item
        listItem.appendChild(fileName);
        listItem.appendChild(removeBtn);
        fileList.appendChild(listItem);
      });

      selectedFilesDiv.appendChild(fileList);

      // Add submit button
      const submitBtn = document.createElement('button');
      submitBtn.className = 'submit-button';
      submitBtn.textContent = 'Submit Evidence';
      submitBtn.addEventListener('click', function () {
        handleFileSubmission(selectedFiles);
      });
      selectedFilesDiv.appendChild(submitBtn);

      // Add styling for the file items
      const fileStyle = document.createElement('style');
      fileStyle.textContent = `
        .file-list {
          list-style: none;
          padding: 0;
          margin: 10px 0;
        }
        
        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 255, 0, 0.1);
          margin: 5px 0;
          padding: 8px 10px;
          border: 1px solid #0f0;
          border-radius: 4px;
        }
        
        .file-name {
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .remove-file {
          color: #f00;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          margin-left: 10px;
          width: 20px;
          height: 20px;
          line-height: 18px;
          text-align: center;
          border-radius: 50%;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid #f00;
        }
        
        .remove-file:hover {
          background: rgba(255, 0, 0, 0.3);
        }
      `;
      document.head.appendChild(fileStyle);
    }
  }

  function handleFileSubmission(files) {
    // Check if the important file is included before showing success message
    let hasImportantFile = false;

    for (let i = 0; i < files.length; i++) {
      if (files[i].name === "logfile1.txt") {
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

    // Convert our file array to a FileList-like object for the verification function
    const fileListObj = {
      length: files.length,
      item: index => files[index],
      [Symbol.iterator]: function* () {
        for (let i = 0; i < this.length; i++) {
          yield this.item(i);
        }
      }
    };

    // Assign numeric indices to the fileListObj
    files.forEach((file, index) => {
      fileListObj[index] = file;
    });

    // Verify files and launch the game popup
    verifyAndLaunchGame(fileListObj);

    // Trigger email notification
    triggerFinalUploadEmail();

    // Clear the selected files after submission
    selectedFiles = [];
  }
});
