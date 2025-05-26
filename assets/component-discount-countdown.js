document.addEventListener("DOMContentLoaded", function () {
  const countdownTimer = document.querySelector(".count-timer");
  if (!countdownTimer) return;

  const countdownContent = document.querySelector(".count-timer-content");
  const daysEl = document.querySelector(".days");
  const hoursEl = document.querySelector(".hours");
  const minutesEl = document.querySelector(".minutes");
  const secondsEl = document.querySelector(".seconds");

  const endTime = new Date(
    countdownTimer.getAttribute("data-end-time")
  ).getTime();

  function updateCountdown() {
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft < 0) {
      if (countdownContent)
        countdownContent.innerHTML = "<p>Countdown Ended</p>";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(timeLeft / 86400000); // 1000 * 60 * 60 * 24
    const hours = Math.floor((timeLeft % 86400000) / 3600000); // 1000 * 60 * 60
    const minutes = Math.floor((timeLeft % 3600000) / 60000); // 1000 * 60
    const seconds = Math.floor((timeLeft % 60000) / 1000); // 1000

    updateElement(daysEl, days);
    updateElement(hoursEl, hours);
    updateElement(minutesEl, minutes);
    updateElement(secondsEl, seconds);
  }

  function updateElement(element, newValue) {
    if (!element) return;

    const currentValue = parseInt(element.textContent, 10);
    if (currentValue === newValue) return;

    const newSpan = document.createElement("span");
    newSpan.textContent = newValue;
    newSpan.style.transform = "translateY(100%)";
    newSpan.style.position = "absolute";
    newSpan.style.width = "100%";
    newSpan.style.textAlign = "center";
    newSpan.style.transition = "transform 0.3s ease-in-out";

    element.appendChild(newSpan);

    setTimeout(() => {
      newSpan.style.transform = "translateY(0)";
      const firstChild = element.firstChild;
      if (firstChild?.nodeType === 1) {
        firstChild.style.transform = "translateY(-100%)";
      }
    }, 50);

    setTimeout(() => {
      if (element.firstChild) element.removeChild(element.firstChild);
    }, 300);
  }

  const interval = setInterval(updateCountdown, 1000);
  updateCountdown();

  const copyToClipboard = document.querySelector(".copy-to-clipboard");
  const textToCopyElement = document.querySelector("#to-copy");

  function handleCopyAction(button) {
    const originalText = textToCopyElement.textContent;

    navigator.clipboard.writeText(originalText).then(() => {
      button.classList.add("copid");
      textToCopyElement.textContent = "Copied";

      setTimeout(() => {
        textToCopyElement.textContent = originalText;
        button.classList.remove("copid");
      }, 2000);
    }).catch(err => console.error("Failed to copy:", err));
  }

  copyToClipboard.addEventListener("click", function () {
    handleCopyAction(this);
  });

  copyToClipboard.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCopyAction(this);
    }
  });
});
