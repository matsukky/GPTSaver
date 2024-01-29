if (typeof browser === "undefined") {
  var browser = chrome;
}

window.addEventListener('load', function() {
    let isRequesting = false;
    const regex = /^[0-9a-f]{8}(-[0-9a-f]{4}){4}[0-9a-f]{8}$/;
    
    function init() {
      const saveButton = createBtn();
      function appendsaveButton() {
        let buttonsWrapper = document.querySelector('.flex.gap-2.pr-1')
        if(!buttonsWrapper) return 
        buttonsWrapper.appendChild(saveButton);
      }
          appendsaveButton();
        
      setInterval(() => {
        if (!document.querySelector("#saver-button") || document.querySelector("#saver-button").style.display === "none") {
          appendsaveButton();
        }
      }, 500);
    
      saveButton.addEventListener("click", async () => {
        if (isRequesting) return;
        const idConv = window.location.pathname.replace("/c/","").replace("/","");
        if(!idConv || !regex.test(idConv)) return await error(saveButton)
        isRequesting = true;
        saveButton.textContent = "Saving.";
        saveButton.style.cursor = "initial";
        const intervalId = setInterval(function() {
          if(saveButton.textContent == "Saving...") return  saveButton.textContent = "Saving."
          saveButton.textContent += ".";
        }, 500);
      
        const user = await get("https://chat.openai.com/api/auth/session")
        const conversation = await get(`https://chat.openai.com/backend-api/conversation/${idConv}`,{ authorization: `Bearer ${user?.accessToken}`,"Content-Type": "application/json", "user-agent": navigator.userAgent})

        const response = await browser.runtime.sendMessage({ action: "htmlCreator", data: {conversation, session:user.user}, id: idConv});
        try {
          const a = document.createElement('a');
          const urlManager = window.URL || window.webkitURL
          const byteCharacters = atob(response.content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const blob = new Blob([new Uint8Array(byteNumbers)], {type: 'application/zip'})
          a.download = response.fileName;
          a.href = urlManager.createObjectURL(blob);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
        
        setTimeout(() => {
          clearInterval(intervalId);
          saveButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 7.5V9.5C10.5 9.76522 10.3946 10.0196 10.2071 10.2071C10.0196 10.3946 9.76522 10.5 9.5 10.5L2.5 10.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5L1.5 7.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.5 5.5L6 8L8.5 5.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 7.5V1.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>Download with GPTSaver`;
          saveButton.style.cursor = "pointer";
          isRequesting = false;
        }, 1000);

        } catch (err) {
          clearInterval(intervalId);
          console.error(err)
          error(saveButton)
        }
        
      });
    }
    
    async function error(saveButton, errorText) {
      saveButton.style.color = "red"
      saveButton.textContent = errorText || "ERROR : Reload and try again!"; 
      saveButton.style.cursor = "initial";
      setTimeout(() => {
        saveButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 7.5V9.5C10.5 9.76522 10.3946 10.0196 10.2071 10.2071C10.0196 10.3946 9.76522 10.5 9.5 10.5L2.5 10.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5L1.5 7.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.5 5.5L6 8L8.5 5.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 7.5V1.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>Download with GPTSaver`;
        saveButton.style.color = "initial"
        saveButton.style.cursor = "pointer";
      }, 2500);
    }

    function createBtn() {
      const button = document.createElement("button");
    
      button.id = "saver-button";
    
      button.classList.add("btn", "flex", "gap-2", "justify-center", "btn-neutral");
    
      button.innerHTML = `<svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 7.5V9.5C10.5 9.76522 10.3946 10.0196 10.2071 10.2071C10.0196 10.3946 9.76522 10.5 9.5 10.5L2.5 10.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5L1.5 7.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3.5 5.5L6 8L8.5 5.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 7.5V1.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>Download with GPTSaver`;
    
      return button;
    }
    
    init();

  });
 

async function get(url, headers) {
  const response = await fetch(url, {
       headers
    });
  
    if (!response.ok) {
      throw new Error("Unable to get session");
    }
  
    const data = await response.json();
    
  
    if (!data) {
      throw new Error("Unable to get access token");
    }

    return data
}