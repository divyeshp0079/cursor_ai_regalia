window.addEventListener("DOMContentLoaded", function () {
  const inlineMenu = document.querySelector(".header__inline-menu");
  const menuItem = document.querySelector(".header__menu-item.list-menu__item");
  const detailsItems = inlineMenu?.querySelectorAll("details") || [];
  const predictiveSearch = document.querySelector("#predictive-search");
  const body = document.body;

  // Menu hover logic
  detailsItems.forEach((item) => {
    const summaryElement = item.querySelector("summary");
    const ulElement = item.querySelector("ul");
    let closeTimeout;

    item.addEventListener("mouseover", () => {
      clearTimeout(closeTimeout);
      item.setAttribute("open", true);
      summaryElement.classList.add("countryactive");
    });

    ulElement?.addEventListener("mouseleave", () => {
      closeTimeout = setTimeout(() => {
        item.removeAttribute("open");
        summaryElement.classList.remove("countryactive");
      }, 90);
    });

    item.addEventListener("mouseleave", () => {
      closeTimeout = setTimeout(() => {
        item.removeAttribute("open");
        summaryElement.classList.remove("countryactive");
      }, 90);
    });

  });

  // Predictive search logic
  let searchTriggers = document.querySelectorAll(".action-search");
  let searchPopEle = document.querySelector("#predictiveSearchModal");
  let lastSearchTrigger = null; // new variable

  if (searchTriggers.length > 0) {
    searchTriggers.forEach((searchTrigger) => {
      searchTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        lastSearchTrigger = searchTrigger; // store the clicked trigger
        searchPopEle?.classList.add("active");

        setTimeout(() => {
          predictiveSearch?.focus();
        }, 250);

        body.classList.add("search-wrapper-open");
      });
    });
  }

  let searchCloseTrigger = document.querySelector("#closeSearchModal");
  if (searchCloseTrigger) {
    searchCloseTrigger.addEventListener("click", () => {
      searchPopEle?.classList.remove("active");

      if (lastSearchTrigger) lastSearchTrigger.focus();

      if (predictiveSearch) {
        predictiveSearch.value = "";
        predictiveSearch.dispatchEvent(new Event("input"));
      }

      body.classList.remove("search-wrapper-open");
    });
  }

  let inlineSearchClose = document.querySelector(".inline-close");
  if (inlineSearchClose && predictiveSearch) {
    inlineSearchClose.addEventListener("click", () => {
      predictiveSearch.value = "";
      predictiveSearch.style.display = "none";
      body.classList.remove("inline-search-open");
    });
  }
});



// header sticky
let lastScrollTop = 0;
const header = document.querySelector(".section-main-header");
const headerHeight = header.offsetHeight;

window.addEventListener("scroll", function () {
  let currentScroll = window.scrollY;
  if (currentScroll > lastScrollTop) {
    header.classList.add("headerhidden");
    header.style.top = `-${headerHeight}px`;
  } else {
    header.classList.remove("headerhidden");
    header.style.top = "0px";
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// Menu-drawer
document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("drawer-menu-btn");
  const menuList = document.getElementById("drawer-menu-list");
  const hamburgerIcon = document.getElementById("hamburger-icon");
  const closeIcon = document.getElementById("close-icon");
  const drawerMenu = document.querySelector(".menu-drawer-container");
  const body = document.body;

  function updateMenuHeight() {
    const announcementBar = document.querySelector(".section-announcement-bar");
    const headerHeight = document.querySelector(".section-main-header")?.offsetHeight || 0;
    let announcementBarHeight = 0;

    if (announcementBar && announcementBar.offsetHeight > 0 && isElementVisible(announcementBar)) {
      announcementBarHeight = announcementBar.offsetHeight;
    }

    if (menuList) {
      const totalHeight = announcementBarHeight + headerHeight;
      // menuList.style.height = `calc(100vh - ${totalHeight}px)`;
    }
  }

  function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function updateDrawerMenuHeight() {
    const drawerFooter = document.querySelector(".drawer-footer-items");

    if (drawerFooter) {
      drawerFooter.style.display = "block";
      const drawerFooterHeight = drawerFooter.offsetHeight || 0;

      if (drawerMenu) {
        // drawerMenu.style.height = `calc(100vh - ${drawerFooterHeight}px - 30px)`;
      }

      drawerFooter.style.display = "";
    }
  }

  menuBtn.addEventListener("click", function () {
    menuList.classList.toggle("active");

    setTimeout(() => {
      updateMenuHeight();
      updateDrawerMenuHeight();
    }, 10);

    const isMenuOpen = menuList.classList.contains("active");
    hamburgerIcon.style.display = isMenuOpen ? "none" : "inline-block";
    closeIcon.style.display = isMenuOpen ? "inline-block" : "none";

    body.classList.toggle("no-scroll", isMenuOpen);
  });

  updateMenuHeight();

  window.addEventListener("resize", updateMenuHeight);
  window.addEventListener("scroll", updateMenuHeight);
});
