document.addEventListener("DOMContentLoaded", function () {
  const countdownTimers = document.querySelectorAll(".product-countdown");

  countdownTimers.forEach((timer) => {
    const endTime = new Date(timer.getAttribute("data-count-time")).getTime();

    // Cache all element references once
    const dayEls = Array.from(timer.querySelectorAll("#card-days"));
    const hourEls = Array.from(timer.querySelectorAll("#card-hours"));
    const minuteEls = Array.from(timer.querySelectorAll("#card-minutes"));
    const secondEls = Array.from(timer.querySelectorAll("#card-seconds"));

    let lastValues = { days: null, hours: null, minutes: null, seconds: null };
    let ended = false;

    function updateCountdown() {
      const now = Date.now();
      const timeLeft = endTime - now;

      if (timeLeft < 0) {
        if (!ended) {
          ended = true;
          // Remove only if text node exists as first child
          if (timer.firstChild?.nodeType === 3) {
            timer.removeChild(timer.firstChild);
          }
          timer.textContent = "Countdown Ended";
        }
        return;
      }

      // Precompute time units once
      const days = Math.floor(timeLeft / 86400000); 
      const hours = Math.floor((timeLeft % 86400000) / 3600000); 
      const minutes = Math.floor((timeLeft % 3600000) / 60000);  
      const seconds = Math.floor((timeLeft % 60000) / 1000);

      // Update only if value changed
      if (lastValues.days !== days) {
        for (let el of dayEls) el.textContent = days;
        lastValues.days = days;
      }
      if (lastValues.hours !== hours) {
        for (let el of hourEls) el.textContent = hours;
        lastValues.hours = hours;
      }
      if (lastValues.minutes !== minutes) {
        for (let el of minuteEls) el.textContent = minutes;
        lastValues.minutes = minutes;
      }
      if (lastValues.seconds !== seconds) {
        for (let el of secondEls) el.textContent = seconds;
        lastValues.seconds = seconds;
      }
    }

    updateCountdown();


    setInterval(() => {
      requestAnimationFrame(updateCountdown);
    }, 1000);
  });
});
