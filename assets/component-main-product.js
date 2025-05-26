document.addEventListener('DOMContentLoaded', function() {
  // Initialize Swiper
  const thumbsSwiper = new Swiper('.gallery-thumbs', {
    spaceBetween: 26,
    direction: 'vertical',
    slidesPerView: 2.3,
    watchSlidesProgress: true,
  });

  window.mainSwiper = new Swiper('.gallery-main', {
    spaceBetween: 0,
    navigation: {
      nextEl: '.swiper--next',
      prevEl: '.swiper--prev',
    },
    thumbs: {
      swiper: thumbsSwiper,
    },
  });

  // Delivery date range display
  const deliveryElement = document.getElementById("estimated-delivery");
  if (deliveryElement) {
    const startOffset =
      parseInt(deliveryElement.getAttribute("data-start")) || 2;
    const endOffset = parseInt(deliveryElement.getAttribute("data-end")) || 4;
    const deliveryDateRange = calculateDeliveryDateRange(
      startOffset,
      endOffset
    );

    const estimatedText =
      document.querySelector(".delivery-text")?.getAttribute("data-text") || "";

    // Create a span for estimatedText with a class
    const estimatedTextSpan = document.createElement("span");
    estimatedTextSpan.className = "estimated-text";
    estimatedTextSpan.textContent = estimatedText;

    // Create a span for deliveryDateRange with a class
    const deliveryDateSpan = document.createElement("span");
    deliveryDateSpan.className = "delivery-date-range";
    deliveryDateSpan.textContent = ` ${deliveryDateRange}`;

    // Clear content and append both spans
    deliveryElement.textContent = "";
    deliveryElement.appendChild(estimatedTextSpan);
    deliveryElement.appendChild(deliveryDateSpan);
  }

  // Social share copy
  window.CopyTolink = function(inputId) {
    var inputField = document.getElementById(inputId);
    var urlToCopy = inputField.getAttribute("data-url");
    navigator.clipboard
      .writeText(urlToCopy)
      .then(function () {
        inputField.value = "Link copied to clipboard!";
        setTimeout(() => {
          inputField.value = urlToCopy;
        }, 2000);
      })
      .catch(function (err) {
        console.error("Failed to copy: ", err);
      });
  };

  // Pickup content
  window.pickupcontent = function() {
    const variantIdElement = document.querySelector(
      ".product-block.block-buy_button .product-variant-id"
    );
    if (!variantIdElement) {
      console.error("Variant ID element not found.");
      return;
    }
    const variantId = variantIdElement.value;

    const baseUrlElement = document.querySelector(
      ".product-single__store-availability-container"
    );
    const baseUrl = baseUrlElement?.getAttribute("data-base-url");
    if (!baseUrl) {
      console.error("Base URL not found.");
      return;
    }

    const variantSectionUrl = `${baseUrl}/variants/${variantId}/?section_id=pickup-availability`;
    fetch(variantSectionUrl)
      .then((response) => response.text())
      .then((text) => {
        const container = document.querySelector(
          "[data-store-availability-container]"
        );
        if (!container) {
          console.error("Store availability container not found.");
          return;
        }
        const pickupAvailabilityHTML = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector(".shopify-section");
        if (!pickupAvailabilityHTML) {
          console.error("Pickup availability section not found in the response.");
          return;
        }
        container.innerHTML = "";
        container.appendChild(pickupAvailabilityHTML);

        const checkElement = document.querySelector(
          ".js-modal-open-pickup-availability-modal"
        );
        const popUpcontent = document.querySelector(
          ".pickup-availabilities-modal"
        );
        const closePopup = document.querySelector(
          ".pickup-availabilities-modal__close"
        );
        if (checkElement && popUpcontent && closePopup) {
          checkElement.addEventListener("click", function () {
            popUpcontent.classList.add("open");
          });
          closePopup.addEventListener("click", function () {
            popUpcontent.classList.remove("open");
          });
        }
      })
      .catch((e) => {
        console.error("Error fetching variant section:", e);
      });
  };

  // Product option variant base change price, swatch color
  function getCombinedVariant() {
    const checkedColor =
      document.querySelector(".color-variant.checked") ||
      document.querySelector(".multiple-option-variant.checked"),
      productVariant = document.querySelector(".product-variant-id"),
      setPricedetails = document.querySelector(".price__sale"),
      setSkuContent = document.querySelector(".sku-content"),
      setStockCount = document.querySelector("#stock-count"),
      stockContent = document.querySelector(".stock-indicator"),
      instockLabel = document.querySelector(".pro-status-message"),
      atcBtnContent = document.querySelector(".atcbtn-content .atcbtn-text"),
      atcButton = document.querySelector(".product-form__submit.atc-btn"),
      stockBarContainer = document.querySelector(".stock-bar-container"),
      stockText = document.querySelector(".stock-indicator p"),
      stickyVariant = document.querySelector(
        ".sticky-details-wrapper .product-variant-id"
      ),
      stickyBtnContent = document.querySelector(
        ".sticky-details-wrapper .atcbtn-content .atcbtn-text"
      ),
      stickyButton = document.querySelector(
        ".sticky-details-wrapper .product-form__submit.atc-btn"
      ),
      stickyVariantchange = document.querySelector(
        ".sticky-details-wrapper .select-variant"
      ),
      checkoutBtn = document.querySelector(".checkoutbtn-text");

    let selectedVariants = [];

    document
      .querySelectorAll(".product-options-content fieldset")
      .forEach((fieldset) => {
        const checkedOption = fieldset.querySelector(".checked");
        if (checkedOption) {
          const variantName =
            checkedOption.getAttribute("data-variant-name") ||
            checkedOption.getAttribute("data-multiple-variant");

          if (variantName) {
            selectedVariants.push(variantName);
            const selectVariantElement = fieldset.querySelector(
              ".select-variant, .select-color-variant"
            );
            const selectDropdownElement = fieldset.querySelector(
              ".variant-options .select-variant, .variant-options .select-color-variant"
            );
            if (selectVariantElement) {
              selectVariantElement.textContent = variantName;
            }
            if (selectDropdownElement) {
              selectDropdownElement.textContent = variantName;
            }
          }
        }
      });

    if (selectedVariants.length === 0) return;
    const combinedVariant = selectedVariants.join(" / ");
    console.log("Looking for:", combinedVariant);
    const matchingOption = document.querySelector(
      `.combination_id option[data-variant-name="${combinedVariant}"]`
    );
    if (stickyVariantchange) {
      stickyVariantchange.textContent = combinedVariant;
    }
    if (matchingOption) {
      const variantId = matchingOption.value;
      if (productVariant) productVariant.value = variantId;
      if (stickyVariant) stickyVariant.value = variantId;
      pickupcontent();

      const variantStock = parseInt(matchingOption.getAttribute("data-variant-left")) || 0;
      matchingOption.setAttribute("selectedVariant", "true");


      if (atcBtnContent && atcButton && stockText && checkoutBtn && stockBarContainer && stockContent) {
        if (variantStock === 0) {
           if(instockLabel){
              instockLabel.textContent = "OUT OF STOCK";
            }
          atcBtnContent.textContent = "Sold Out";  
          atcBtnContent.classList.remove("effect-text");
          atcButton.setAttribute("disabled", "disabled");
          stockText.style.display = "none";
          checkoutBtn.style.display = "none";
          stockBarContainer.style.display = "none";
          if (!document.querySelector(".out-of-stock-message")) {
            const outOfStockDiv = document.createElement("div");
            outOfStockDiv.className = "out-of-stock-message";
            outOfStockDiv.textContent = "Out of Stock";
            stockContent.appendChild(outOfStockDiv);
          }
        } else {
            if(instockLabel){
              instockLabel.textContent = "In stock";
            }
          atcBtnContent.textContent = "Add to Cart";  
          atcBtnContent.classList.add("effect-text");
          atcButton.removeAttribute("disabled");
          stockText.style.display = "block";
          stockBarContainer.style.display = "block";
          checkoutBtn.style.display = "block";
          const outOfStockDiv = document.querySelector(".out-of-stock-message");
          if (outOfStockDiv) outOfStockDiv.remove();
        }
      }
      if (stickyBtnContent && stickyButton) {
        if (variantStock === 0) {
          stickyBtnContent.textContent = "Sold Out";
          stickyBtnContent.classList.remove("effect-text");
          stickyButton.setAttribute("disabled", "disabled");
        } else {
          stickyBtnContent.textContent = "Add to Cart";
          stickyBtnContent.classList.add("effect-text");
          stickyButton.removeAttribute("disabled");
        }
      }
      if (window.location.pathname.includes("/products/")) {
        const newUrl = `${
          window.location.origin + window.location.pathname
        }?variant=${variantId}`;
        history.pushState(null, "", newUrl);
      }
      setPricedetails && (setPricedetails.innerHTML = matchingOption.innerHTML);
      setSkuContent &&
        (setSkuContent.textContent =
          matchingOption.getAttribute("data-variant-sku") || "SKU: N/A");
      setStockCount &&
        (setStockCount.textContent = variantStock
          ? `${variantStock}`
          : "Out of Stock");

      // Update stock bar dynamically
      updateStockBar(variantStock);
    } else {
      console.error(`No match found for: "${combinedVariant}"`);
        if(instockLabel){
              instockLabel.textContent = "unavailable";
        }
      atcButton.classList.add("unavailable");
      atcBtnContent.textContent = "Unavailable";
      atcBtnContent.classList.remove("effect-text");
      atcButton.setAttribute("disabled", "disabled");
      stockText.style.display = "none";
      checkoutBtn.style.display = "none";
      stockBarContainer.style.display = "none";
      stickyBtnContent.textContent = "Unavailable";
      stickyBtnContent.classList.remove("effect-text");
      stickyButton.setAttribute("disabled", "disabled");
      if (!document.querySelector(".out-of-stock-message")) {
        const outOfStockDiv = document.createElement("div");
        outOfStockDiv.className = "out-of-stock-message";
        outOfStockDiv.textContent = "This combination is unavailable";
        stockContent.appendChild(outOfStockDiv);
      }
    }
    // Update sold message
    const soldMessage = document.getElementById("sold-message");

    if (soldMessage) {
      const minSold = parseInt(soldMessage.dataset.minSold, 10);
      const maxSold = parseInt(soldMessage.dataset.maxSold, 10);
      const hours = soldMessage.dataset.hours;

      // Generate a random number between minSold and maxSold
      const randomSold =
        Math.floor(Math.random() * (maxSold - minSold + 1)) + minSold;

      // Update the message
      soldMessage.innerHTML = `<span class="prosold-text">${randomSold} products sold</span><span class="lasthours-text"> in the last ${hours} hours.</span>`;
    }

    // Apply .soldout class to unavailable options
// Replace ONLY this block in your getCombinedVariant() function:
// "Apply .soldout class to unavailable options" section

document
  .querySelectorAll(".mainproduct .product-options-content fieldset")
  .forEach((fieldset, fieldsetIndex) => {
    fieldset
      .querySelectorAll(".variant-option, .color-variant")
      .forEach((option) => {
        const optionVariant =
          option.getAttribute("data-variant-name") ||
          option.getAttribute("data-multiple-variant");

        if (!optionVariant) return;

        // If more than one variant, never mark the first fieldset's options as soldout
        if (selectedVariants.length > 1 && fieldsetIndex === 0) {
          option.classList.remove("soldout");
          return;
        }

        let variantKey = "";
        if (selectedVariants.length === 1) {
          variantKey = optionVariant;
        } else if (selectedVariants.length === 2) {
          const temp = [...selectedVariants];
          temp[fieldsetIndex] = optionVariant;
          variantKey = temp.join(" / ");
        } else if (selectedVariants.length === 3) {
          const temp = [...selectedVariants];
          temp[fieldsetIndex] = optionVariant;
          variantKey = temp.join(" / ");
        }

        const stockOption = document.querySelector(
          `.mainproduct .combination_id option[data-variant-name="${variantKey}"]`
        );
        if (
          stockOption &&
          parseInt(stockOption.getAttribute("data-variant-left")) === 0
        ) {
          option.classList.add("soldout");
        } else {
          option.classList.remove("soldout");
        }
      });
  });
  }

  function updateStockBar(currentStock) {
    const maxStock = 50; // Set your maximum stock manually or dynamically
    const stockCountElement = document.getElementById("stock-count");
    const stockBarElement = document.getElementById("stock-bar");

    if (stockCountElement) {
      stockCountElement.textContent = currentStock;
    }

    if (stockBarElement) {
      const stockPercentage = (currentStock / maxStock) * 100;
      stockBarElement.style.width = `${stockPercentage}%`;

      // Change bar color based on stock levels
      if (currentStock <= 10) {
        stockBarElement.style.backgroundColor = "#ff5f5f"; // Low stock (red)
      } else if (currentStock <= 20) {
        stockBarElement.style.backgroundColor = "#F44336"; // Medium stock (yellow)
      } else {
        stockBarElement.style.backgroundColor = "#4caf50"; // High stock (green)
      }
    }
  }

  // Side cart drawer
  const sideCart = document.querySelector(".side-cartdrawer");
  if (sideCart) {
    sideCart.addEventListener("click", function (event) {
      event.preventDefault();
      updateCartDrawer();
    });
  }

  // Add to cart button
  document.querySelectorAll(".mainproduct .product-form__submit.atc-btn").forEach((button) => {
    const handleAddToCart = function (event) {
      event.preventDefault();
      if (event.type === "click" || (event.type === "keydown" && (event.key === "Enter" || event.keyCode === 13))) {
        let form = this.closest("form");
        let formData = new FormData(form);

        const quantityPicker = document.querySelector(
          ".mainproduct quantity-picker input[name='quantity']"
        );
        if (quantityPicker) {
          let quantity = quantityPicker.value;
          formData.set("quantity", quantity);
        }

        fetch("/cart/add.js", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            updateCartDrawer();
          })
          .catch((error) =>
            console.error("Error adding product:", error)
          );
      }
    };

    button.addEventListener("click", handleAddToCart);
    button.addEventListener("keydown", handleAddToCart);
  });

  // Cart drawer functions
  function openCartDrawer() {
    const cartDrawer = document.getElementById("cart-drawer");
    if(cartDrawer) {
      document.documentElement.classList.add("js-drawer-open");
      cartDrawer.classList.add("open");
      attachCartDrawerOutsideClickListener();
    }
  }

  function closeCartDrawer() {
    const cartDrawer = document.getElementById("cart-drawer");
    if(cartDrawer) {
      document.documentElement.classList.remove("js-drawer-open");
      cartDrawer.classList.remove("open");
    }
  }

  function removeCartDrawer() {
    const cartDrawerIcon = document.querySelector(".cartdrawer-icon");
    if (cartDrawerIcon) {
      cartDrawerIcon.addEventListener("click", function () {
        closeCartDrawer();
      });
    }
  }

  function attachCartDrawerOutsideClickListener() {
    document.addEventListener("click", function (event) {
      const cartDrawer = document.getElementById("cart-drawer");
      if (!cartDrawer) return;
      const isClickInside = cartDrawer.contains(event.target);

      if (!isClickInside && cartDrawer.classList.contains("open")) {
        document.documentElement.classList.remove("js-drawer-open");
        cartDrawer.classList.remove("open");
      }
    });
  }

  function updateCartDrawer() {
    fetch("/?sections=cart-drawer")
      .then((response) => response.json())
      .then((data) => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(
          data["cart-drawer"],
          "text/html"
        );

        // Update cart drawer content
        let updatedCartDrawer = doc.querySelector("#cart-drawer");
        let cartDrawer = document.querySelector("#cart-drawer");
        if (updatedCartDrawer && cartDrawer) {
          cartDrawer.innerHTML = updatedCartDrawer.innerHTML;
        }

        // Update total price
        let updatedTotalPrice = doc.querySelector(".totals__total-value");
        if (updatedTotalPrice) {
          document.querySelector(".totals__total-value").innerHTML =
            updatedTotalPrice.innerHTML;
        }

        fetch("/cart.js")
          .then((res) => res.json())
          .then((cart) => {
            let cartItemCount = cart.item_count;
            let headerCartCount =
              document.querySelector("[data-cart-count]");
            let drawerCartCount = document.querySelector(
              "[data-cartdrawer-count]"
            );

            if (headerCartCount) {
              headerCartCount.textContent = `${cartItemCount}`;
            }
            if (drawerCartCount) {
              drawerCartCount.textContent = `(${cartItemCount})`;
            }
            if (
              cartItemCount > 0 &&
              !document.getElementById("cart-drawer").classList.contains("open")
            ) {
              openCartDrawer();
            }
          })
          .catch((error) =>
            console.error("Error fetching cart count:", error)
          );

        attachRemoveItemEvents();
        attachQuantityUpdateEvents();
        addTocart();
        removeCartDrawer();
      })
      .catch((error) => console.error("Error updating cart:", error));
  }

  function attachRemoveItemEvents() {
    document.querySelectorAll(".cart-remove-link").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();

        let lineIndex = this.getAttribute("data-line");
        if (!lineIndex) {
          console.error("Error: Line index not found!");
          return;
        }

        fetch("/cart/change.js", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            line: parseInt(lineIndex),
            quantity: 0,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.item_count === 0) {
              document.querySelector(".cart-items").innerHTML = `
                <div class="empty-cart">
                  <h1 class="h3">Hmm... looks like your bag is empty.</h1>
                  <a href="/collections/all" class="btn btn-secondary">
                    Continue shopping
                  </a>
                </div>
              `;
            } else {
              updateCartDrawer();
            }
          })
          .catch((error) => console.error("Error removing item:", error));
      });
    });
  }

  function attachQuantityUpdateEvents() {
    document.querySelectorAll("#cart-drawer .qnt-input").forEach((button) => {
      button.addEventListener("click", function () {
        let quantityPicker = this.closest(".qnt-input-wrapper");
        if (!quantityPicker) {
          console.error("Error: .quantity-picker not found!");
          return;
        }
        let quantityInput = quantityPicker.querySelector(
          "input[name='quantity']"
        );
        if (!quantityInput) {
          console.error("Error: Quantity input not found!");
          return;
        }

        let quantity = parseInt(quantityInput.value);
        let maxQuantity =
          parseInt(quantityInput.getAttribute("data-max")) || Infinity;
        let lineIndex = parseInt(
          quantityInput.closest("tr")?.getAttribute("data-index")
        );

        if (isNaN(lineIndex)) {
          console.error("Error: Line index not found!");
          return;
        }

        if (
          this.classList.contains("qnt-inc") &&
          quantity < maxQuantity
        ) {
          quantity++;
        } else if (this.classList.contains("qnt-dec") && quantity > 1) {
          quantity--;
        }

        updateCartItem(lineIndex, quantity);
      });
    });
  }

  function addTocart() {
    document.querySelectorAll(".productadd-drawer").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();

        let form = this.closest("form");
        let formData = new FormData(form);

        const quantityPicker = document.querySelector(
          "input[name='quantity'].cart-drawer-col"
        );
        if (quantityPicker) {
          let quantity = quantityPicker.value;
          formData.set("quantity", quantity);
        }

        fetch("/cart/add.js", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            updateCartDrawer();
          })
          .catch((error) =>
            console.error("Error adding product:", error)
          );
      });
    });
  }

  // Update cart item quantity
  function updateCartItem(lineIndex, quantity) {
    fetch("/cart/change.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ line: lineIndex, quantity: quantity }),
    })
      .then((response) => response.json())
      .then((data) => {
        updateCartDrawer();
      })
      .catch((error) => console.error("Error updating cart:", error));
  }

  // Variant change handlers
  getCombinedVariant();

  const swiperSlides = document.querySelectorAll(".media-item");
  const swiperInstance = window.mainSwiper;

  document.querySelectorAll(".color-variant, .multiple-option-variant")
    .forEach((element) => {
      const prodvariantHandle = (el) => {
        const parentFieldset = el.closest("fieldset");
        if (parentFieldset) {
          parentFieldset
            .querySelectorAll(".checked")
            .forEach((el) => el.classList.remove("checked"));
        }

        const selectedValue = el.dataset.color?.toLowerCase();

        let matchedSlideIndex = -1;

        swiperSlides.forEach((slide, index) => {
          const img = slide.querySelector("img.variant-image");
          if (img && img.dataset.variant.toLowerCase() === selectedValue) {
            matchedSlideIndex = index;
          }
        });

        if (matchedSlideIndex !== -1 && swiperInstance) {
          swiperInstance.slideTo(matchedSlideIndex);
        }

        el.classList.add("checked");
        getCombinedVariant();
      };

      element.addEventListener("click", () => {
        prodvariantHandle(element);
      });

      element.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          prodvariantHandle(element);
        }
      });
    });

  // Sticky cart js
  const target = document.querySelector(".product-block.block-buy_button"),
    stickyCart = document.querySelector(".sticky-content"),
    stickyContent = document.querySelector("sticky-cart"),
    footerPrivacy = document.querySelector(".privacy-policy-text");
  if (target && stickyCart && stickyContent && footerPrivacy) {
    const observer = new IntersectionObserver(
      (entries) => {
        let isStickyHidden = false;
        entries.forEach((entry) => {
          if ((entry.target === target || entry.target === footerPrivacy) && entry.isIntersecting) {
            isStickyHidden = true;
          }
        });
        if (isStickyHidden) {
          stickyCart.classList.remove("active");
          stickyContent.setAttribute('aria-hidden', 'false');
        } else {
          stickyCart.classList.add("active");
          stickyContent.setAttribute('aria-hidden', 'true');
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(target);
    observer.observe(footerPrivacy);
  }

  // pswp popup body class
  const pswpElement = document.querySelector(".pswp");
  if (pswpElement) {
    const observer = new MutationObserver(() => {
      if (pswpElement.classList.contains("pswp--open")) {
        document.body.classList.add("pswp-popup-body");
      } else {
        document.body.classList.remove("pswp-popup-body");
      }
    });

    observer.observe(pswpElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  // Variant dropdown
  const dropdowns = document.querySelectorAll(".dropdown-variant");
  dropdowns.forEach((dropdown) => {
    const selectedOption = dropdown.querySelector(".dropdownList");
    const optionsList = dropdown;
    const options = dropdown.querySelectorAll(".dropdown-swatch");

    if (!selectedOption || !optionsList) {
      console.error("Dropdown structure is incomplete!");
      return;
    }

    // Toggle dropdown on click
    selectedOption.addEventListener("click", (e) => {
      e.stopPropagation();
      optionsList.classList.toggle("open");
    });

    // Handle option selection
    options.forEach((option) => {
      option.addEventListener("click", () => {
        optionsList.classList.remove("open");
      });
    });
  });

  // Close any open dropdown when clicking outside
  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
      }
    });
  });

  // Add tabindex for accessibility
  document.querySelectorAll(".product-block")
    .forEach((element) => {
      element.setAttribute("tabindex", "0");
    });
});

// Delivery date range calculation
function calculateDeliveryDateRange(startOffset, endOffset) {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);

  startDate.setDate(today.getDate() + startOffset);
  endDate.setDate(today.getDate() + endOffset);

  const options = { month: "short", day: "numeric" };
  const formattedStartDate = startDate.toLocaleDateString("en-US", options);
  const formattedEndDate = endDate.toLocaleDateString("en-US", options);

  return `${formattedStartDate} - ${formattedEndDate}`;
}

// Popup functions
function openPopup() {
  document.getElementById("popupOverlay").style.display = "block";
  document.addEventListener("keydown", handleKeyPress);
  document.body.classList.add("popupOverlay-body");
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
  document.removeEventListener("keydown", handleKeyPress);
  document.body.classList.remove("popupOverlay-body");
}

function handleKeyPress(e) {
  if (e.key === "Escape") {
    closePopup();
  }
}

// Close popup when clicking outside the content
window.onclick = function (event) {
  const overlay = document.getElementById("popupOverlay");
  if (overlay && event.target === overlay) {
    closePopup();
  }
};