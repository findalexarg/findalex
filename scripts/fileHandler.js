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
    'text/plain'
  ];

  let hasValidFile = false;
  let fileTypeMessage = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Log the file type for debugging
    console.log("Verifying file type:", file.type);
    if (validFileTypes.includes(file.type)) {
      hasValidFile = true;

      // You can customize fileTypeMessage based on file name/type if needed.
      if (file.name.toLowerCase().includes('evidence') || file.type.startsWith('image/')) {
        fileTypeMessage = 'Image evidence detected';
      } else if (file.type === 'application/pdf' || file.type.includes('document')) {
        fileTypeMessage = 'Document evidence detected';
      }
    }
  }

  if (!hasValidFile) {
    alert('Please upload valid evidence files (images, PDFs, or documents)');
    return;
  }

  // If we reach here, we have valid files - launch the game
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

// Initialize file handling functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById('fileInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');

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
    // Show a verification message
    selectedFilesDiv.innerHTML = '<div class="evidence-verified"><h3>Evidence Received</h3><p>Thank you for your submission. Your evidence is being processed.</p><button class="reload-btn" onclick="location.reload()">Submit More Evidence</button></div>';

    // Verify files and launch the game popup
    verifyAndLaunchGame(files);

    // Optional: trigger email notification
    triggerFinalUploadEmail();
  }
});