window.theme = window.theme || {};

// Money format
theme.formatMoney = function (cents, format) {
  // theme.formatMoney(10000,theme.money_format)
  if (typeof cents == "string") {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;

  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";
    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

// image lazy loading
if (!customElements.get("lazy-image")) {
  class lazyLoad extends HTMLElement {
    constructor() {
      super();
      this.lazyLoadFn();
    }
    lazyLoadFn = () => {
      const img = this.querySelector("img");
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let image = entry.target;
            setTimeout(() => {
              let imageHeight = image.clientHeight;
              if (imageHeight == 0) {
                imageHeight = 100;
              }
              let imageWidth = image.clientWidth;
              if (imageWidth == 0) {
                imageWidth = 100;
              }
              if (
                image.src.indexOf("width") > 0 ||
                image.src.indexOf("height") > 0
              ) {
                let baseImgUrl = image.src
                  .replace(/&width=[0-9]/, "")
                  .replace(/&height=[0-9]/, "");
                if (imageHeight >= imageWidth) {
                  image.src = `${baseImgUrl}&height=${imageHeight}`;
                } else {
                  image.src = `${baseImgUrl}&width=${imageWidth}`;
                }
              } else {
                if (imageHeight >= imageWidth) {
                  image.src = `${image.src}&height=${imageHeight}`;
                } else {
                  image.src = `${image.src}&width=${imageWidth}`;
                }
              }
            }, 500);
            image.classList.add("img-loaded");
            io.unobserve(image);
          }
        });
      });
      if (img) {
        io.observe(img);
      }
      if (Shopify.designMode) {
        const customizationEvents = [
          "shopify:inspector:activate",
          "shopify:inspector:deactivate",
          "shopify:section:load",
          "shopify:block:deselect",
          "shopify:section:reorder",
          "shopify:section:select",
          "shopify:section:deselect",
          "shopify:inspector:activate",
          "shopify:inspector:deactivate",
        ];
        customizationEvents.forEach((event) => {
          document.addEventListener(event, () => io.observe(img));
        });
      }
    };
  }
  customElements.define("lazy-image", lazyLoad);
}

theme.hideQuantityWrapper = () => {
  let mobileQuantity = document.querySelector(".desk-hide .qnt-input-wrapper");
  let desktopQuantity = document.querySelector(
    ".mobile-hide .qnt-input-wrapper"
  );

  if (window.innerWidth < 767) {
    if (mobileQuantity) {
      desktopQuantity.remove();
    }
  }
  if (window.innerWidth > 767) {
    if (desktopQuantity) {
      mobileQuantity.remove();
    }
  }
};

// Global quantity picker used in cart and product page

if (!customElements.get("quantity-picker")) {
  class QuantityPicker extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.incBtn = this.querySelector(".global-qty-picker .qnt-inc");
      this.decBtn = this.querySelector(".global-qty-picker .qnt-dec");
      this.inputField = this.querySelector(
        '.global-qty-picker input[type="number"]'
      );

      if (!this.incBtn || !this.decBtn || !this.inputField) {
        console.error("QuantityPicker: Required elements are missing.");
        return;
      }

      this.incBtn.addEventListener("click", this.onIncrease.bind(this));
      this.decBtn.addEventListener("click", this.onDecrease.bind(this));
      this.inputField.addEventListener(
        "change",
        this.handleNegativeInput.bind(this)
      );
    }

    onIncrease() {
      this.inputField.value = parseInt(this.inputField.value) + 1;
      this.inputField.dispatchEvent(new Event("change"));
    }

    onDecrease() {
      if (parseInt(this.inputField.value) > 1) {
        this.inputField.value = parseInt(this.inputField.value) - 1;
      }
      this.inputField.dispatchEvent(new Event("change"));
    }

    handleNegativeInput() {
      let parsedValue = parseFloat(this.inputField.value);
      if (isNaN(parsedValue) || parsedValue < 1) {
        this.inputField.value = 1;
      } else {
        this.inputField.value = Math.ceil(parsedValue);
      }
    }
  }

  customElements.define("quantity-picker", QuantityPicker);
}

theme.infiniteScroll = () => {
  let cacheCount = 0;
  let productEle = document.querySelector("[data-next-page]");
  if (productEle) {
    const intersectionObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        let infiniteProductEle = document.querySelector("[data-next-page]");
        let url = infiniteProductEle.dataset.nextPage;
        if (url != "") {
          cacheCount++;
        }
        if (url != "") {
          fetch(url)
            .then((res) => res.text())
            .then((data) => {
              cacheCount = 0;
              var dataHTML = new DOMParser().parseFromString(data, "text/html");
              let newProductGrid =
                dataHTML.querySelector("[data-next-page]").innerHTML;
              infiniteProductEle.insertAdjacentHTML(
                "beforeend",
                newProductGrid
              );
              infiniteProductEle.dataset.nextPage =
                dataHTML.querySelector("[data-next-page]").dataset.nextPage;
              updateProductCount();
              if (
                document.querySelector("[data-next-page]").dataset.nextPage !=
                ""
              ) {
                document.querySelector(".pagination-loader").style.display =
                  null;
              } else {
                document.querySelector(".pagination-loader").style.display =
                  "none";
              }
              theme.onScrollAnimation();
            });
        } else {
          document.querySelector(".pagination-loader").style.display = "none";
          intersectionObserver.disconnect();
        }
      }
    });
    intersectionObserver.observe(document.querySelector(".pagination-loader"));
  }
};
function updateProductCount() {
  let visibleProducts = document.querySelectorAll(
    "#ProductCardContainer .collection-grid .product-item"
  ).length;
  let productCountElement = document.querySelector(".product-count");

  if (productCountElement) {
    productCountElement.innerText = `Showing ${visibleProducts} products`;
    localStorage.setItem("storedProductCount", visibleProducts);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  let savedCount = localStorage.getItem("storedProductCount");
  let productCountElement = document.querySelector(".product-count");
  let activeFilters = document.querySelector(".filter-group--applied"); // Checks if filters are applied

  if (savedCount && productCountElement) {
    if (activeFilters) {
      productCountElement.innerText = `Showing ${savedCount} products`;
    } else {
      localStorage.removeItem("storedProductCount");
      updateProductCount();
    }
  }
});
document.addEventListener("click", (event) => {
  // Detect when a filter is applied
  if (event.target.closest(".filter-group.filter-group--applied")) {
    setTimeout(updateProductCount, 500);
  }

  // Detect when filters are cleared
  if (event.target.classList.contains("filter-group__clear-link")) {
    localStorage.removeItem("storedProductCount");
    setTimeout(updateProductCount, 500);
  }
});

// Language and Country.js
theme.languageAndCountry = () => {
  const elements = {
    lang: document.querySelectorAll(".defaultlanguage"),
    langData: document.querySelectorAll(".language-selector"),
    country: document.querySelectorAll(".countryrelative"),
    countryData: document.querySelectorAll(".country-cont-data"),
  };

  if (
    ![
      ...elements.lang,
      ...elements.langData,
      ...elements.country,
      ...elements.countryData,
    ].length
  ) {
    console.error("Required elements not found.");
    return;
  }

  const hideAll = () => {
    document
      .querySelectorAll(".countryactive")
      .forEach((el) => el.classList.remove("countryactive"));
    document
      .querySelectorAll(".language-selector, .country-cont-data")
      .forEach((el) => (el.style.display = "none"));
  };

  const setupClickHandlers = (btns, dropdowns) => {
    btns.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdown(btn, dropdowns[index]);
      });

      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleDropdown(btn, dropdowns[index]);
        }
      });
    });
  };

  const toggleDropdown = (btn, dropdown) => {
    const isActive = btn.classList.contains("countryactive");
    hideAll();
    if (!isActive) {
      btn.classList.add("countryactive");
      dropdown.style.display = "block";
    }
  };

  setupClickHandlers(elements.lang, elements.langData);
  setupClickHandlers(elements.country, elements.countryData);

  document.addEventListener("click", hideAll);
};

// Language items on header
theme.languageOnHeader = () => {
  const languageItems = document.querySelectorAll(
    "#HeaderLanguageList .language_item"
  );
  languageItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      const languageValue = this.querySelector("a").getAttribute("data-value");
      const currentUrl = new URL(window.location.href);
      let basePath = currentUrl.pathname
        .replace(/\/[a-zA-Z-]+\/?$/, "")
        .replace(/\/$/, "");
      if (languageValue === "en") {
        basePath = "";
      } else {
        basePath = `${basePath}/${languageValue}`;
      }
      const newUrl = `${currentUrl.origin}${basePath}`;
      window.location.href = newUrl;
    });
  });
};

theme.productCollectionGrid = () => {
  document.querySelectorAll(".prod-column-change").forEach((btn) => {
    const handleGridChange = () => {
      document
        .querySelectorAll(".prod-column-change")
        .forEach((el) => el.classList.remove("activeGrid"));
      btn.classList.add("activeGrid");
      document
        .querySelector(".collection-grid")
        ?.setAttribute("data-grid-column", btn.getAttribute("grid-layout"));
    };

    btn.addEventListener("click", handleGridChange);

    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleGridChange();
      }
    });
  });
};

// Animation.js
theme.onScrollAnimation = () => {
  let animationELe = document.querySelectorAll("[ms-aos]");
  let animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let animationDelay = entry.target.dataset?.msDelay;
          if (animationDelay) {
            animationDelay = parseInt(animationDelay);
            setTimeout(() => {
              entry.target.classList.add("ms-animated");
            }, animationDelay);
          } else {
            entry.target.classList.add("ms-animated");
          }
        }
      });
    },
    { threshold: [0.25] }
  );
  animationELe.forEach((ele) => {
    animationObserver.observe(ele);
  });
};

// Collection sidebar menu
window.theme.collectionSidebar = () => {
  document.querySelectorAll(".submenu-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggle.nextElementSibling?.classList.toggle("open");
      toggle.querySelector(".icon svg")?.classList.toggle("rotate");
    });
  });
};

theme.backtoTop = () => {
  const backToTopButton = document.querySelector(".back-to-top-btn");
  if (backToTopButton) {
    backToTopButton.onclick = () =>
      document.documentElement.scroll({
        top: 0,
        behavior: "smooth",
      });
    window.onscroll = () => {
      if (document.documentElement.scrollTop > 60) {
        backToTopButton.classList.remove("hidden");
      } else {
        backToTopButton.classList.add("hidden");
      }
    };
  }
};

theme.closeFilter = () => {
  let filterBtn = document.querySelector(
    ".utility-bar__left .utility-bar__item"
  );
  let filterClose = document.querySelectorAll(
    ".filter-modal-overlay,.mobile-header .button-icon"
  );
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      document
        .querySelector(".utility-bar__left .utility-bar__item")
        .classList.toggle("active");
      document.querySelector(".facets-container").classList.toggle("active");
      document.body.classList.toggle("facets-container-active");
    });
  }
  if (filterClose.length > 0) {
    filterClose.forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelector(".utility-bar__left .utility-bar__item")
          .classList.remove("active");
        document.querySelector(".facets-container").classList.remove("active");
        document.body.classList.remove("facets-container-active");
      });
    });
  }
};

theme.passwordShowHide = () => {
  let eyeShows = document.querySelectorAll(".eye-show");
  let eyeHides = document.querySelectorAll(".eye-hide");
  let passwordFields = document.querySelectorAll(".password-input");

  eyeHides.forEach((eyeHide, index) => {
    eyeHide.addEventListener("click", function () {
      eyeHide.style.display = "none";
      eyeShows[index].style.display = "block";
      passwordFields[index].type = "text";
    });
  });
  eyeShows.forEach((eyeShow, index) => {
    eyeShow.addEventListener("click", function () {
      console.log("clikc");
      eyeShow.style.display = "none";
      eyeHides[index].style.display = "block";
      passwordFields[index].type = "password";
    });
  });
};

theme.toggleColors = () => {
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("toggle-colors-btn")) {
      let button = event.target;
      let parent = button.closest(".product-card-swatches");
      let hiddenColors = parent.querySelectorAll(".hidden-color");

      if (hiddenColors.length === 0) {
        return; // Prevents error if no hidden colors
      }

      if (button.classList.contains("expanded")) {
        hiddenColors.forEach((color) => (color.style.display = "none"));
        let hiddenCount = hiddenColors.length;
        button.textContent = `+${hiddenCount}`;
      } else {
        let hiddenCount = hiddenColors.length;
        hiddenColors.forEach((color) => (color.style.display = "inline-block"));
        button.textContent = `-${hiddenCount}`;
      }

      button.classList.toggle("expanded");
    }
  });
};

window.addEventListener("DOMContentLoaded", function () {
  theme.onScrollAnimation();
  window.theme.languageAndCountry();
  window.theme.languageOnHeader();
  window.theme.hideQuantityWrapper();
  window.theme.productCollectionGrid();
  window.theme.collectionSidebar();
  window.theme.infiniteScroll();
  window.theme.backtoTop();
  window.theme.closeFilter();
  window.theme.passwordShowHide();
  window.theme.toggleColors();
  if (Shopify.designMode) {
    const customizationEvents = [
      "shopify:inspector:activate",
      "shopify:inspector:deactivate",
      "shopify:section:load",
      "shopify:block:deselect",
      "shopify:section:reorder",
      "shopify:section:select",
      "shopify:section:deselect",
      "shopify:inspector:activate",
      "shopify:inspector:deactivate",
    ];
    customizationEvents.forEach((event) => {
      document.addEventListener(event, () => window.theme.onScrollAnimation());
    });
  }
});

document.querySelectorAll(".open-quick-popup").forEach((button) => {
  button.addEventListener("click", function () {
    const gallery = this.closest(".featured-product-content"); // changed from .gallery
    if (gallery) {
      const popupOverlay = gallery.querySelector(".popup-overlay");
      if (popupOverlay) {
        popupOverlay.style.display = "block";
      } else {
        console.warn(".popupOverlay not found inside .main-image-slider");
      }
    } else {
      console.warn(".main-image-slider not found as a parent of .open-popup");
    }
  });
});

// Close popup
document.querySelectorAll(".close-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const popup = this.closest(".popup-overlay");
    if (popup) popup.style.display = "none";
    document.body.classList.remove("popupOverlay-body");
  });
});

document.querySelectorAll(".btn-copy-quick").forEach((btn) => {
  btn.addEventListener("click", function () {
    const container = this.closest(".share-product-url");
    const inputContent = container?.querySelector(".field__input");
    if (!inputContent) return;

    inputContent.select();
    inputContent.setSelectionRange(0, 99999);
    navigator.clipboard
      .writeText(inputContent.value)
      .then(() => {
        const origText = inputContent.value;
        inputContent.value = "Link copied to clipboard!";
        setTimeout(() => {
          inputContent.value = origText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
      });
  });
});
