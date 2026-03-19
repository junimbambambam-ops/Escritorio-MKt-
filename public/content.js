// content.js
console.log("Virtual Office WhatsApp extension loaded.");

const APP_URL = "https://ais-pre-t35kipttdmxzucdk7xau2p-210901668433.us-east1.run.app";

function injectFloatingButton() {
  const button = document.createElement("div");
  button.id = "vo-floating-button";
  button.innerHTML = `
    <div class="vo-btn-content">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>
  `;
  document.body.appendChild(button);

  button.addEventListener("click", toggleOverlay);
}

let overlayVisible = false;
let overlayFrame = null;

function toggleOverlay() {
  overlayVisible = !overlayVisible;
  
  if (overlayVisible) {
    if (!overlayFrame) {
      overlayFrame = document.createElement("iframe");
      overlayFrame.id = "vo-overlay-frame";
      overlayFrame.src = APP_URL;
      document.body.appendChild(overlayFrame);
    }
    overlayFrame.style.display = "block";
  } else {
    if (overlayFrame) {
      overlayFrame.style.display = "none";
    }
  }
}

// Wait for WhatsApp Web to load
const checkExist = setInterval(() => {
  if (document.querySelector('body')) {
    injectFloatingButton();
    clearInterval(checkExist);
  }
}, 1000);

// Listen for messages from the iframe
window.addEventListener("message", (event) => {
  if (event.origin !== APP_URL) return;

  if (event.data.type === "OPEN_WHATSAPP_CHAT") {
    const phone = event.data.phone;
    // WhatsApp Web specific logic to open a chat
    // This is a simplified version, real implementation might need to click elements
    window.location.href = `https://web.whatsapp.com/send?phone=${phone}`;
  }
});
