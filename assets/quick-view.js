if (!customElements.get("quick-view")) {
  class quickView extends HTMLElement {
    constructor() {
      super();

      this.quickviewBtns = this.querySelectorAll("button");
      this.productJson = this.querySelector("script")
        ? JSON.parse(this.querySelector("script").textContent)
        : null;

      const closestContainer = this.closest(".quick-view__closest");
      this.quickViewEle = closestContainer
        ? closestContainer.querySelector("#quickViewModal")
        : null;

      if (
        this.quickviewBtns.length > 0 &&
        this.productJson &&
        this.quickViewEle
      ) {
        this.onClick();
        this.onClose();
      }
    }

    onClick = () => {
      this.quickviewBtns.forEach((quickBtn) => {
        quickBtn.addEventListener("click", () => {
          this.initQuickView();
        });
      });
    };

    onClose = () => {
      const closestContainer = this.closest(".quick-view__closest");
      if (!closestContainer) return;

      let quickviewClose = closestContainer.querySelector(".quick-view-close");
      let overlayclose = closestContainer.querySelector(".overlay-background");

      if (quickviewClose) {
        quickviewClose.addEventListener("click", () => {
          this.closeQuickView();
        });

        quickviewClose.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.closeQuickView();
          }
        });
      }

      if (quickviewClose) {
        quickviewClose.addEventListener("click", () => {
          this.closeQuickView();
        });
      }
      if (overlayclose) {
        overlayclose.addEventListener("click", () => {
          this.closeQuickView();
        });
      }
    };

    initQuickView = () => {
      if (!this.productJson || !this.quickViewEle) return;
      this.quickViewEle.classList.add("active");
      console.log(this.quickViewEle);
      this.url = `/products/${this.productJson.handle}/?section_id=quick-view`;
      fetch(this.url)
        .then((res) => res.text())
        .then((body) => {
          const closestContainer = this.closest(".quick-view__closest");
          if (!closestContainer) return;

          let quickView = closestContainer.querySelector("#quickView");
          if (quickView) {
            this.quickViewEle.innerHTML = body;
            quickView.classList.add("active");
            document.body.classList.add("quick-view-popup");

            setTimeout(() => {
              this.initSwiper();
              this.initVariantSelection();
              this.initQuantityPicker();
              this.initializeSharepopup();
              this.initializeDropdowns();
              this.initPhotswipe(); 
            }, 100);
          }
        });
    };

    closeQuickView = () => {
      const closestContainer = this.closest(".quick-view__closest");
      if (!closestContainer) return;

      let quickView = closestContainer.querySelector("#quickView");
      if (quickView) {
        quickView.classList.remove("active");
      }
      document.body.classList.remove("quick-view-popup");
      document.body.classList.remove("popupOverlay-body");

      if (this.quickViewEle) {
        this.quickViewEle.classList.remove("active");
      }
       const closegalleryElement = document.querySelector("#product-gallery");
       closegalleryElement.removeAttribute("data-pswp-initialized");
    };

    initSwiper = () => {
      const thumbsContainer = document.querySelector(".quick-view-thumbs");
      const mainContainer = document.querySelector(".quick-view-main");

      if (!thumbsContainer || !mainContainer) return;

      const thumbsSwiper = new Swiper(thumbsContainer, {
        spaceBetween: 26,
        direction: "vertical",
        slidesPerView: 2.3,
        watchSlidesProgress: true,
      });

      new Swiper(mainContainer, {
        spaceBetween: 0,
        navigation: {
          nextEl: ".swiper--next",
          prevEl: ".swiper--prev",
        },
        thumbs: {
          swiper: thumbsSwiper,
        },
      });
    };

    initVariantSelection = () => {
      this.getCombinedVariant();
      document
        .querySelectorAll(
          "#quickViewModal .color-variant, #quickViewModal .multiple-option-variant"
        )
        .forEach((element) => {
          element.addEventListener("click", () => {
            const parentFieldset = element.closest("fieldset");
            if (parentFieldset) {
              parentFieldset
                .querySelectorAll(".checked")
                .forEach((el) => el.classList.remove("checked"));
            }
            element.classList.add("checked");
            this.getCombinedVariant();
          });
        });
    };

    initializeSharepopup = () => {
      document.querySelectorAll(".open-quick-popup").forEach((button) => {
        button.addEventListener("click", function () {
          const gallery = this.closest(".main-image-slider"); // changed from .gallery
          if (gallery) {
            const popupOverlay = gallery.querySelector(".popup-overlay");
            if (popupOverlay) {
              popupOverlay.style.display = "block";
            } else {
              console.warn(".popupOverlay not found inside .main-image-slider");
            }
          } else {
            console.warn(
              ".main-image-slider not found as a parent of .open-popup"
            );
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
    };



initPhotswipe = () => {
  if (typeof PhotoSwipeLightbox === "undefined") {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.0/photoswipe.js";
    script.onload = () => {
      this.initializePhotoSwipe();
    };
    script.onerror = () => {
      console.error(
        "Failed to load PhotoSwipeLightbox script. Please check the script path:",
        script.src
      );
    };
    document.body.appendChild(script);
  } else {
    this.initializePhotoSwipe();
  }

  const quickPhotoSwipeButton = document.querySelector(
    ".img-overlay-icon .quickphotoswipe"
  );

  if (quickPhotoSwipeButton) {
    quickPhotoSwipeButton.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default behavior
      this.openPhotoSwipeAtIndex(0); // Always open at index 0
    });
  }
};

initializePhotoSwipe = () => {
  const galleryElement = document.querySelector("#product-gallery");
  if (galleryElement && !galleryElement.hasAttribute("data-pswp-initialized")) {
    const items = [];

    // Collect data for each a[href] in the gallery
    galleryElement.querySelectorAll("a[href]").forEach((link) => {
      const width = link.getAttribute("data-width");
      const height = link.getAttribute("data-height");
      const src = link.getAttribute("href");
      const thumb = link.querySelector("img").getAttribute("src");

      items.push({
        src: src,
        w: parseInt(width, 10),
        h: parseInt(height, 10),
        msrc: thumb, // Optional thumbnail
      });
    });

    if (items.length > 0) {
      galleryElement.setAttribute("data-pswp-initialized", "true");
      this.photoSwipeItems = items; // Store items for later use

      // Attach click event to gallery links for default behavior
      galleryElement.querySelectorAll("a[href]").forEach((link, index) => {
        link.addEventListener("click", (event) => {
          event.preventDefault(); // Prevent default link behavior
          this.openPhotoSwipeAtIndex(index); // Open at the clicked index
        });
      });
    } else {
      console.error("No gallery items found.");
    }
  }
};

openPhotoSwipeAtIndex = (index) => {
  if (!this.photoSwipeItems || this.photoSwipeItems.length === 0) {
    console.error("No PhotoSwipe items to display.");
    return;
  }

  const pswpElement = document.querySelector(".pswp");

  const options = {
    captionEl: false,
    index: index, // Open at the specified index
    closeOnOutsideClick: true,
    shareEl: false,
    bgOpacity: 1,
    closeOnScroll: false,
    preloaderEl: true,
    zoomEl: false,
    fullscreenEl: false,
    showHideOpacity: true,
    clickToCloseNonZoomable: false,
    allowPanToNext: false,
  };

  const gallery = new PhotoSwipe(
    pswpElement,
    PhotoSwipeUI_Default,
    this.photoSwipeItems,
    options
  );
  gallery.init();
};
    initializeDropdowns = () => {
      const dropdowns = document.querySelectorAll(
        "#quickViewModal .dropdown-variant"
      );

      dropdowns.forEach((dropdown) => {
        const selectedOption = dropdown.querySelector(
          "#quickViewModal .dropdownList"
        );
        const optionsList = dropdown;
        const options = dropdown.querySelectorAll(
          "#quickViewModal .dropdown-swatch"
        );

        if (!selectedOption || !optionsList) {
          console.error("Dropdown structure is incomplete!");
          return;
        }

        // Toggle dropdown on click
        selectedOption.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent event bubbling to document
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
    };

    getCombinedVariant = () => {
      const checkedColor =
          document.querySelector("#quickViewModal .color-variant.checked") ||
          document.querySelector(
            "#quickViewModal .multiple-option-variant.checked"
          ),
        productVariant = document.querySelector(
          "#quickViewModal .product-variant-id"
        ),
        instockLabel = document.querySelector("#quickViewModal .pro-status-message"),
        atcBtnContent = document.querySelector(
          "#quickViewModal .atcbtn-content .atcbtn-text"
        ),
        atcButton = document.querySelector(
          "#quickViewModal .product-form__submit.atc-btn"
        ),
        setPricedetails = document.querySelector(
          "#quickViewModal .price__sale"
        ),
        setSkuContent = document.querySelector("#quickViewModal .sku-content"),
        stockText = document.querySelector(
          "#quickViewModal .stock-indicator p"
        ),
        stockCount = document.querySelector("#quickViewModal #stock-count"),
        stockContent = document.querySelector(
          "#quickViewModal .stock-indicator"
        ),
        stockBarContainer = document.querySelector(
          "#quickViewModal .stock-bar-container"
        ),
        checkoutBtn = document.querySelector(
          "#quickViewModal .checkoutbtn-text"
        );

      let quickselectedVariants = [];

      if (!checkedColor) return;
      const variantActive = checkedColor.getAttribute("data-variant-name");

      document
        .querySelectorAll("#quickViewModal .color-variant label")
        .forEach((label) => {
          label.style.backgroundColor = "";
        });
      const label = checkedColor.querySelector("label");
      label && (label.style.backgroundColor = variantActive);

      document
        .querySelectorAll("#quickViewModal .product-options-content fieldset")
        .forEach((fieldset) => {
          const checkedOption = fieldset.querySelector(".checked");

          if (checkedOption) {
            const variantName =
              checkedOption.getAttribute("data-variant-name") ||
              checkedOption.getAttribute("data-multiple-variant");
            if (variantName) {
              quickselectedVariants.push(variantName);

              const selectVariantElement = fieldset.querySelector(
                ".select-variant, .select-color-variant"
              );
              const selectDropdownElement = fieldset.querySelector(
                "#quickViewModal .variant-options .select-variant, #quickViewModal .variant-options .select-color-variant"
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

      if (quickselectedVariants.length === 0) return;

      const combinedVariant = quickselectedVariants.join(" / ");

      const matchingOption = document.querySelector(
        `#quickViewModal .combination_id option[data-variant-name="${combinedVariant}"]`
      );
      if (matchingOption) {
        const variantId = matchingOption.value;
        productVariant.value = variantId;
        const variantStock =
          parseInt(matchingOption.getAttribute("data-variant-left")) || 0;
        matchingOption.setAttribute("selectedVariant", "true");
        // ✅ **Update stock count**
        if (stockCount) {
          stockCount.textContent = variantStock;
        }
        if (atcBtnContent) {
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
            // Update stock bar dynamically
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

            const outOfStockDiv = document.querySelector(
              ".out-of-stock-message"
            );
            if (outOfStockDiv) outOfStockDiv.remove();
          }
        }
        setPricedetails &&
          (setPricedetails.innerHTML = matchingOption.innerHTML);
        setSkuContent &&
          (setSkuContent.textContent =
            matchingOption.getAttribute("data-variant-sku") || "SKU: N/A");
        // Update stock bar dynamically

        updateStockBar(variantStock);
      } else {
        console.error(`No below side match found for: "${combinedVariant}"`);
        atcButton.classList.add("unavailable");
        atcBtnContent.textContent = "Unavailable";
        atcBtnContent.classList.remove("effect-text");
        atcButton.setAttribute("disabled", "disabled");
        stockText.style.display = "none";
        checkoutBtn.style.display = "none";
        stockBarContainer.style.display = "none";
        if(instockLabel){
              instockLabel.textContent = "unavailable";
        }
        if (!document.querySelector(".out-of-stock-message")) {
        const outOfStockDiv = document.createElement("div");
        outOfStockDiv.className = "out-of-stock-message";
        outOfStockDiv.textContent = "This combination is unavailable";
        stockContent.appendChild(outOfStockDiv);
        }
      }
      // Apply .soldout class to unavailable options
      document
        .querySelectorAll("#quickViewModal .product-options-content fieldset")
        .forEach((fieldset) => {
          fieldset
            .querySelectorAll("#quickViewModal .variant-option")
            .forEach((option) => {
              const optionVariant =
                option.getAttribute("data-variant-name") ||
                option.getAttribute("data-multiple-variant");

              if (optionVariant) {
                // Declare variantKey before using it
                let variantKey = "";

                if (quickselectedVariants.length === 2) {
                  variantKey = `${quickselectedVariants[0]} / ${optionVariant}`;
                } else if (quickselectedVariants.length === 3) {
                  variantKey = [
                    quickselectedVariants[0],
                    quickselectedVariants[1],
                    optionVariant, // Use optionVariant for the third variant
                  ]
                    .filter(Boolean)
                    .join(" / ");
                }

                const stockOption = document.querySelector(
                  `#quickViewModal .combination_id option[data-variant-name="${variantKey}"]`
                );
                if (
                  stockOption &&
                  parseInt(stockOption.getAttribute("data-variant-left")) === 0
                ) {
                  option.classList.add("soldout");
                } else {
                  option.classList.remove("soldout");
                }
              }
            });
        });
      // product-sold in 24hours

      const soldMessage = document.querySelector(
        "#quickViewModal #sold-message"
      );

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

      // stock-indaictor
      function updateStockBar(currentStock) {
        const maxStock = 50; // Set your maximum stock manually or dynamically
        const stockCountElement = document.querySelector(
          "#quickViewModal #stock-count"
        );
        const stockBarElement = document.querySelector(
          "#quickViewModal #stock-bar"
        ); // Ensure correct selection

        if (stockCountElement) {
          stockCountElement.textContent = currentStock;
        }
        console.log(stockCountElement);
        if (stockBarElement) {
          requestAnimationFrame(() => {
            // Ensure styles are applied properly
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

            console.log(
              `Updated stock bar width: ${stockBarElement.style.width}`
            );
          });
        }
      }

      document
        .querySelectorAll("#quickViewModal .product-form__submit.atc-btn")
        .forEach((button) => {
          button.addEventListener("click", function (event) {
            event.preventDefault();
            console.log("hey clicked");
            let form = this.closest("form");
            let formData = new FormData(form);

            const quantityPicker = document.querySelector(
              "quantity-picker input[name='quantity']"
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
                console.log("Product Added:", data);
                updateCartDrawer();
              })
              .catch((error) => console.error("Error adding product:", error));
          });
        });

      // Function to open cart drawer
      function openCartDrawer() {
        const cartDrawer = document.getElementById("cart-drawer");
        document.documentElement.classList.add("js-drawer-open");
        cartDrawer.classList.add("open");

        attachCartDrawerOutsideClickListener();
      }

      function closeCartDrawer() {
        const cartDrawer = document.getElementById("cart-drawer");
        document.documentElement.classList.remove("js-drawer-open");
        cartDrawer.classList.remove("open");
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
          const isClickInside = cartDrawer.contains(event.target);

          // Close only if click is outside cart drawer
          if (!isClickInside && cartDrawer.classList.contains("open")) {
            document.documentElement.classList.remove("js-drawer-open");
            cartDrawer.classList.remove("open");
          }
        });
      }

      // Function to update the cart drawer dynamically
      function updateCartDrawer() {
        fetch("/?sections=cart-drawer")
          .then((response) => response.json())
          .then((data) => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(data["cart-drawer"], "text/html");

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
                  !document
                    .getElementById("cart-drawer")
                    .classList.contains("open")
                ) {
                  openCartDrawer();
                }
              })
              .catch((error) =>
                console.error("Error fetching cart count:", error)
              );

            attachRemoveItemEvents();
            attachQuantityUpdateEvents();
            // initializeDropdowns();
            addTocart();
            removeCartDrawer();
            // openCartDrawer();
          })
          .catch((error) => console.error("Error updating cart:", error));
      }

      function attachRemoveItemEvents() {
        document.querySelectorAll(".cart-remove-link").forEach((button) => {
          button.addEventListener("click", function (event) {
            event.preventDefault();

            let lineIndex = this.getAttribute("data-line");
            console.log("line", lineIndex);
            if (!lineIndex) {
              console.error("Error: Line index not found!");
              return;
            }

            // Remove item using AJAX
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
                console.log("Item removed:", data);
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

      // // Call the function when the DOM is fully loaded
      // document.addEventListener("DOMContentLoaded", initializeDropdowns);

      function attachQuantityUpdateEvents() {
        document
          .querySelectorAll("#cart-drawer .qnt-input")
          .forEach((button) => {
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

            console.log("hey clicked");
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
                console.log("Product Added:", data);
                updateCartDrawer();
              })
              .catch((error) => console.error("Error adding product:", error));
          });
        });
      }

      // Function to update cart item quantity
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
            console.log("Cart Updated:", data);
            updateCartDrawer();
          })
          .catch((error) => console.error("Error updating cart:", error));
      }
    };

    initQuantityPicker = () => {
      const incBtn = document.querySelector(
        "#quickViewModal .global-qty-picker .qnt-inc"
      );
      const decBtn = document.querySelector(
        "#quickViewModal .global-qty-picker .qnt-dec"
      );
      const inputField = document.querySelector(
        '#quickViewModal .global-qty-picker input[type="number"]'
      );

      if (!incBtn || !decBtn || !inputField) {
        console.error("QuantityPicker: Required elements are missing.");
        return;
      }

      incBtn.addEventListener("click", () => {
        inputField.value = parseInt(inputField.value) + 1;
        inputField.dispatchEvent(new Event("change"));
      });

      decBtn.addEventListener("click", () => {
        if (parseInt(inputField.value) > 1) {
          inputField.value = parseInt(inputField.value) - 1;
        }
        inputField.dispatchEvent(new Event("change"));
      });

      inputField.addEventListener("change", () => {
        let parsedValue = parseFloat(inputField.value);
        if (isNaN(parsedValue) || parsedValue < 1) {
          inputField.value = 1;
        }
      });
    };
  }
  customElements.define("quick-view", quickView);
}

document.addEventListener("DOMContentLoaded", function () {
  const quickViewElement = document.querySelector("quick-view");
  if (quickViewElement) {
    quickViewElement.initSwiper();
  }
});
