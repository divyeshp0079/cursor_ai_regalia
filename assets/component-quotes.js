document.addEventListener("DOMContentLoaded", () => {
  const logos = document.querySelectorAll(".quote-logo");
  const quotes = document.querySelectorAll(".quote-content");

  logos.forEach((logo, index) => {
    logo.addEventListener("mouseover", () => {
      logos.forEach((logo) => logo.classList.remove("active"));
      quotes.forEach((quote) => quote.classList.remove("active"));

      logo.classList.add("active");
      quotes[index].classList.add("active");
    });
  });
});
