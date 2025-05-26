document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const viewAllContents = document.querySelectorAll(".viewall-tab-content");

  if (tabButtons.length > 0) {
    tabButtons[0].classList.add("active");

    const firstTabId = tabButtons[0].getAttribute("data-tab");
    const tabIndex = firstTabId.replace("tab-", "");

    // Show first product tab
    document.getElementById(`tab-${tabIndex}`).style.display = "grid";

    // Show first viewall tab
    const viewAllTab = document.getElementById(`tab-viewall-${tabIndex}`);
    if (viewAllTab) viewAllTab.style.display = "grid";
  }

  function tabChnage(button) {
    const tabId = button.getAttribute("data-tab");
    const tabIndex = tabId.replace("tab-", "");

    // Remove active state
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => (content.style.display = "none"));
    viewAllContents.forEach((content) => (content.style.display = "none"));

    // Activate clicked tab
    button.classList.add("active");

    // Show matching product tab
    const mainTab = document.getElementById(`tab-${tabIndex}`);
    if (mainTab) mainTab.style.display = "grid";

    // Show matching viewall tab
    const viewAllTab = document.getElementById(`tab-viewall-${tabIndex}`);
    if (viewAllTab) viewAllTab.style.display = "grid";
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      tabChnage(this);
    });

    button.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tabChnage(this);
      }
    });
  });
});
