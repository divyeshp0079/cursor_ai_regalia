document.addEventListener("DOMContentLoaded", function () {
  function setupFooterDropdowns() {
    if (window.innerWidth <= 768) {
      document.querySelectorAll(".footer-navigation").forEach((section) => {
        let heading = section.querySelector(".footer-menu-heading");
        let nav = section.querySelector("nav");

        if (heading && nav) {
          heading.style.cursor = "pointer";
          nav.style.display = "none";

          heading.addEventListener("click", function () {
            let isOpen = nav.style.display === "block";
            document
              .querySelectorAll(".footer-navigation .footer-menu-heading")
              .forEach((h) => h.classList.remove("open"));
            document
              .querySelectorAll(".footer-navigation nav")
              .forEach((n) => (n.style.display = "none"));

            if (!isOpen) {
              nav.style.display = "block";
              heading.classList.add("open");
            }
          });
        }
      });
    }
  }

function validateNewsletterForm() {
  var checkbox = document.getElementById('privacy-policy');
  if (!checkbox) return true; 

  if (!checkbox.checked) {
    return false;
  }
  return true;
}


  setupFooterDropdowns();
  validateNewsletterForm();
  window.addEventListener("resize", setupFooterDropdowns);
});
