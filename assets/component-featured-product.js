// Product sold message
document.addEventListener("DOMContentLoaded", function () {
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
});

theme.featuredProduct = () => {
  // Pause/stop the slider when new block/announcement added
  if (Shopify.designMode) {
    document.addEventListener("shopify:block:select", (e) => {
      let targetEle = e.target,
        sliderIndex = 1 + parseInt(targetEle.dataset.swiperSlideIndex);
      swiper.slideTo(sliderIndex);
      swiper.autoplay.paused();
    });
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
      document.addEventListener(event, () => swiper.init(swiperOptions));
    });
  }
};

window.addEventListener("DOMContentLoaded", () => {
  theme.featuredProduct();
});

document.addEventListener("DOMContentLoaded", function () {
  function getCombinedVariant() {
    const checkedColor = document.querySelector(
        ".featured-product .color-variant.checked"
      ),
      productVariant = document.querySelector(
        ".featured-product .product-variant-id"
      ),
      setPricedetails = document.querySelector(
        ".featured-product .price__sale"
      ),
      instockLabel = document.querySelector(".featured-product .pro-status-message"),
      setSkuContent = document.querySelector(".featured-product .sku-content"),
      setStockCount = document.querySelector(".featured-product #stock-count"),
      stockContent = document.querySelector(
        ".featured-product .stock-indicator"
      ),
      atcBtnContent = document.querySelector(
        ".featured-product .atcbtn-content .atcbtn-text"
      ),
      atcButton = document.querySelector(
        ".featured-product .product-form__submit.atc-btn"
      ),
      stockBarContainer = document.querySelector(
        ".featured-product .stock-bar-container"
      ),
      stockText = document.querySelector(
        ".featured-product .stock-indicator p"
      ),
      checkoutBtn = document.querySelector(
        ".featured-product .checkoutbtn-text"
      );

    const selectedVariants = [];

    if (!checkedColor) return;
    const variantActive = checkedColor.getAttribute("data-variant-name");

    document
      .querySelectorAll(".featured-product .color-variant label")
      .forEach((label) => {
        label.style.backgroundColor = "";
      });
    const label = checkedColor.querySelector("label");
    label && (label.style.backgroundColor = variantActive);

    // Find all selected variant options dynamically
    document
      .querySelectorAll(".featured-product .product-options-content fieldset")
      .forEach((fieldset) => {
        const checkedOption = fieldset.querySelector(".checked");

        if (checkedOption) {
          const variantName =
            checkedOption.getAttribute("data-variant-name") ||
            checkedOption.getAttribute("data-multiple-variant");

          if (variantName) {
            selectedVariants.push(variantName);

            // Update UI text
            const selectVariantElement = fieldset.querySelector(
              ".select-variant, .select-color-variant"
            );
            const selectDropdownElement = fieldset.querySelector(
              ".variant-options .select-variant, .variant-options .select-color-variant"
            );
            if (selectVariantElement) {
              selectVariantElement.textContent = variantName;
            }
            if(selectDropdownElement){
              selectDropdownElement.textContent = variantName;
            }
          }
        }
      });

    if (selectedVariants.length === 0) return;

    // Combine variants dynamically in the same order as Shopify
    const combinedVariant = selectedVariants.join(" / ");

    // Find the matching variant in the select dropdown
    const matchingOption = document.querySelector(
      `.featured-product .combination_id option[data-variant-name="${combinedVariant}"]`
    );
    if (matchingOption) {
      const variantId = matchingOption.value;
      productVariant.value = variantId;
      const variantStock =
        parseInt(matchingOption.getAttribute("data-variant-left")) || 0;
      matchingOption.setAttribute("selectedVariant", "true");
      // Update ATC button based on stock count
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

      // Update URL only on the product page
      if (window.location.pathname.includes("/products/")) {
        const newUrl = `${
          window.location.origin + window.location.pathname
        }?variant=${variantId}`;
        history.pushState(null, "", newUrl);
      }

      // Update price details
      setPricedetails && (setPricedetails.innerHTML = matchingOption.innerHTML);
      setSkuContent &&
        (setSkuContent.textContent =
          matchingOption.getAttribute("data-variant-sku") || "SKU: N/A");
      setStockCount &&
        (setStockCount.textContent = variantStock
          ? `${variantStock}`
          : "Out of Stock");
      updateStockBar(variantStock);
    } else {
      console.error(`No match found for: "${combinedVariant}"`);
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
      .querySelectorAll(".featured-product .product-options-content fieldset")
      .forEach((fieldset) => {
        fieldset
          .querySelectorAll(".featured-product .variant-option")
          .forEach((option) => {
            const optionVariant =
              option.getAttribute("data-variant-name") ||
              option.getAttribute("data-multiple-variant");

            if (optionVariant) {
              // let variantKey = "";
              if (selectedVariants.length === 2) {
                variantKey = `${selectedVariants[0]} / ${optionVariant}`;
              } else if (selectedVariants.length === 3) {
                variantKey = [
                  selectedVariants[0],
                  selectedVariants[1],
                  selectedVariants[2],
                ]
                  .filter(Boolean)
                  .join(" / ");
              }
              const stockOption = document.querySelector(
                `.featured-product .combination_id option[data-variant-name="${variantKey}"]`
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
  }

  function updateStockBar(currentStock) {
    const maxStock = 50;
    const stockBarElement = document.querySelector(
      ".featured-product #stock-bar"
    );

    if (stockBarElement) {
      const stockPercentage = (currentStock / maxStock) * 100;
      stockBarElement.style.width = `${stockPercentage}%`;

      stockBarElement.style.backgroundColor =
        currentStock <= 10
          ? "#ff5f5f"
          : currentStock <= 20
          ? "#F44336"
          : "#4caf50";
    }
  }

    document.querySelectorAll(".featured-product .product-form__submit.atc-btn").forEach((button) => {
            button.addEventListener("click", function (event) {
              event.preventDefault();
              console.log("hey clicked");
              let form = this.closest("form");
              let formData = new FormData(form);

              const quantityPicker = document.querySelector(
                ".featured-product quantity-picker input[name='quantity']"
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
                .catch((error) =>
                  console.error("Error adding product:", error)
                );
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
                    if (cartItemCount > 0 && !document.getElementById("cart-drawer").classList.contains("open")) {
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
        
      
        function addTocart(){
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
                .catch((error) =>
                  console.error("Error adding product:", error)
                );
            });
          });
          }

   
      
  

  // Initialize
  getCombinedVariant();

  // Event listener for all variant selections
  document
    .querySelectorAll(
      ".featured-product .color-variant,.featured-product .multiple-option-variant"
    )
    .forEach((element) => {
      element.addEventListener("click", function () {
        const parentFieldset = this.closest("fieldset");
        if (parentFieldset) {
          parentFieldset
            .querySelectorAll(".product-options-content .checked")
            .forEach((el) => el.classList.remove("checked"));
        }
        this.classList.add("checked");
        getCombinedVariant();
      });
    });
});

document.addEventListener("DOMContentLoaded", function () {
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
});    

if (!customElements.get("quantity-picker")) {
  class quantityPicker extends HTMLElement {
    constructor() {
      super();

      // Use scoped selectors within the instance
      this.incBtn = this.querySelector(".featured-product .qnt-inc");
      this.decBtn = this.querySelector(".featured-product .qnt-dec");
      this.inputField = this.querySelector('.featured-product input[type="number"]');

      if (this.incBtn && this.decBtn && this.inputField) {
        this.initEventListeners();
      }
    }

    // Initialize all event listeners
    initEventListeners() {
      this.onIncrease();
      this.onDecrease();
      this.handleNegativeInput();
    }

    onIncrease = () => {
      this.incBtn?.addEventListener("click", () => {
        // Increment the value of the input field
        this.inputField.value = parseInt(this.inputField.value) + 1;
        this.inputField.dispatchEvent(new Event("change"));
      });
    };

    onDecrease = () => {
      this.decBtn?.addEventListener("click", () => {
        // Decrement the value of the input field, ensuring it does not go below 1
        if (parseInt(this.inputField.value) > 1) {
          this.inputField.value = parseInt(this.inputField.value) - 1;
        }
        this.inputField.dispatchEvent(new Event("change"));
      });
    };

    handleNegativeInput = () => {
      this.inputField?.addEventListener("change", () => {
        // Prevent negative or non-numeric input
        let parsedValue = parseFloat(this.inputField.value);
        if (isNaN(parsedValue) || parsedValue < 1) {
          this.inputField.value = 1;
        } else {
          this.inputField.value = Math.ceil(parsedValue);
        }
      });
    };
  }

  customElements.define("quantity-picker", quantityPicker);
}

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
  if (event.target === overlay) {
    closePopup();
  }
};

//  Product page social-share
function CopyTolink(inputId) {
  var inputField = document.getElementById(inputId);
  var urlToCopy = inputField.getAttribute("data-url"); // Get the data-url attribute value

  navigator.clipboard
    .writeText(urlToCopy)
    .then(function () {
      inputField.value = "Link copied to clipboard!"; // Update input field text
      setTimeout(() => {
        inputField.value = urlToCopy; // Reset back to original URL after 2 seconds
      }, 2000);
    })
    .catch(function (err) {
      console.error("Failed to copy: ", err);
    });
}