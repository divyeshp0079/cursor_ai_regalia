document.addEventListener("DOMContentLoaded", function () {
  const countdownTimer = document.querySelector(".countdown-timer");
  if (!countdownTimer) return;

  const endTime = new Date(countdownTimer.getAttribute("data-end-time")).getTime();

  // Cache elements for performance
  const elementCache = {
    "#days": document.querySelector("#days"),
    "#hours": document.querySelector("#hours"),
    "#minutes": document.querySelector("#minutes"),
    "#seconds": document.querySelector("#seconds"),
    "#countdown": document.querySelector("#countdown"),
  };

  function updateCountdown() {
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft < 0) {
      elementCache["#countdown"].innerHTML = "<p>Countdown Ended</p>";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    updateElement("#days", days);
    updateElement("#hours", hours);
    updateElement("#minutes", minutes);
    updateElement("#seconds", seconds);
  }

  function updateElement(selector, newValue) {
    const element = elementCache[selector];
    if (!element) return;

    const currentValue = parseInt(element.textContent, 10);
    if (currentValue === newValue) return;

    const newSpan = document.createElement("span");
    newSpan.textContent = newValue;

    Object.assign(newSpan.style, {
      transform: "translateY(100%)",
      position: "absolute",
      width: "100%",
      textAlign: "center",
      right: "0",
      transition: "transform 0.3s ease-in-out",
    });

    element.appendChild(newSpan);

    setTimeout(() => {
      newSpan.style.transform = "translateY(0)";
      if (element.firstChild?.nodeType === 1) {
        element.firstChild.style.transform = "translateY(-100%)";
      }
    }, 60);

    setTimeout(() => {
      if (element.firstChild) element.removeChild(element.firstChild);
    }, 300);
  }

  const interval = setInterval(updateCountdown, 1000);
  updateCountdown();
});
