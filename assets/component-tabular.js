document.addEventListener("DOMContentLoaded", function () {
  let tabs = document.querySelectorAll(".tab-item");
  let contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      let target = this.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      // Add active class to selected tab and its content
      this.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });
});

document.querySelectorAll(".accordion-header").forEach((button, index) => {
  button.addEventListener("click", function () {
    // Close all other accordions
    document.querySelectorAll(".accordion-header").forEach((otherButton) => {
      if (otherButton !== this) {
        otherButton.classList.remove("active");
        otherButton.nextElementSibling.style.display = "none";
      }
    });

    // Toggle current accordion
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    content.style.display =
      content.style.display === "block" ? "none" : "block";
  });

  // Ensure the first accordion section is open by default
  if (index === 0) {
    button.classList.add("active");
    button.nextElementSibling.style.display = "block";
  }
});
