if (!customElements.get("static-popup")) {
  class staticPopup extends HTMLElement {
    constructor() {
      super();
      this.initPopup();
      this.onSuccess();
      this.onSubmit();
    }

    initPopup() {
      if (!this.getCookie("ms-popup")) {
        let interactionTime = parseInt(this.dataset.timeToInteract);
        window.addEventListener("DOMContentLoaded", () => {
          setTimeout(() => {
            document.body.classList.add("popup-active");
            this.closePop();
          }, interactionTime);
        });
      }
    }

    // Success message handler
    onSuccess() {
      if (location.search.indexOf("customer_posted=true") >= 1) {
        document.body.classList.add("popup-active");
        this.closePop();
      }
    }

    // Submit form handler
    onSubmit() {
      let formEle = this.querySelector("form");
      formEle.addEventListener("submit", () => {
        // Customization popup
        if (!Shopify.designMode && this.dataset.mode != "testing") {
          this.setCookie("ms-popup", "1", "1");
        }
      });
    }

    // Close popup handler
    closePop() {
      let closeBtn = this.querySelector("#sectionPopClose");
      let popupBodyEle = this.querySelector(".popup-body");
      closeBtn.addEventListener("click", (e) => {
        document.body.classList.remove("popup-active");
        if (!Shopify.designMode && this.dataset.mode != "testing") {
          this.setCookie("ms-popup", "1", "1");
        }
      });

      // Close popup when click on outside
      document.addEventListener("click", (e) => {
        if (!popupBodyEle.contains(e.target)) {
          document.body.classList.remove("popup-active");
          // popup in customization
          if (!Shopify.designMode && this.dataset.mode != "testing") {
            this.setCookie("guru-popup", "1", "1");
          }
        }
      });
    }

    // Cookie setup
    setCookie(cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + exdays + ";path=/";
    }
    // Get cookie
    getCookie(cname) {
      let name = cname + "=";
      let decodeCookie = decodeURIComponent(document.cookie);
      let ca = decodeCookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
    // Check cookie
    checkCookie() {
      let username = getCookie("username");
      if (username !== "") {
        alert("Welcome again " + username);
      } else {
        username = prompt("Please enter your name:", "");
        if (username != "" && username != null) {
          setCookie("username", username, 365);
        }
      }
    }
  }
  customElements.define("static-popup", staticPopup);
}
