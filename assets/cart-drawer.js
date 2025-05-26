// cart-drawer js
if (!customElements.get("cart-drawer")) {
  class cartDrawer extends HTMLElement {
    constructor() {
      super();
      this.cartDrawerFn();
    }
    cartDrawerFn = () => {
      document.addEventListener("DOMContentLoaded", function () {
        const cartDrawer = document.getElementById("cart-drawer");
        const sideCart = document.querySelector(".side-cartdrawer");
        sideCart.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
          event.preventDefault();
          updateCartDrawer();
        }
        });
        if (sideCart) {
          sideCart.addEventListener("click", function (event) {
            event.preventDefault();
            updateCartDrawer();
          });
        }

        // Add to Cart functionality
        function initTabSwitcher(tabSelector, contentSelector) {
          const tabs = document.querySelectorAll(tabSelector);

          tabs.forEach((tab) => {
            tab.addEventListener("click", function () {
              const tabId = this.getAttribute("data-tab");

              // Select contents inside the updated cart drawer
              const cartDrawer = document.querySelector("#cart-drawer");
              const contents = cartDrawer
                ? cartDrawer.querySelectorAll(contentSelector)
                : [];

              if (!contents.length) {
                console.warn("No tab content elements found.");
                return;
              }

              // Remove active class from all tabs and contents
              tabs.forEach((t) => t.classList.remove("active"));
              contents.forEach((content) => content.classList.remove("active"));

              // Add active class to clicked tab and corresponding content
              this.classList.add("active");
              const activeContent = cartDrawer.querySelector(`#tab-${tabId}`);
              if (activeContent) {
                activeContent.classList.add("active");
              } else {
                console.warn(`Content for tab-${tabId} not found`);
              }
            });
          });
        }
        // Function to open cart drawer
        function openCartDrawer() {
          document.documentElement.classList.add("js-drawer-open");
          cartDrawer.classList.add("open");
        }

        // Function to close cart drawer
        function closeCartDrawer() {
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
                  let headerCartCount = document.querySelector("[data-cart-count]");
                  let drawerCartCount = document.querySelector("[data-cartdrawer-count]");
                  let cartItemnum = document.querySelector(".side-cartdrawer.header__icon--cart");
                  if (headerCartCount) {
                    headerCartCount.textContent = `${cartItemCount}`;
                  }
                  if (drawerCartCount) {
                    drawerCartCount.textContent = `${cartItemCount}`;
                  }
                  if (cartItemnum) {
  if (cartItemCount > 0) {
    openCartDrawer();
    cartItemnum.classList.add("cartNumber");
  } else {
    cartItemnum.classList.remove("cartNumber");
  }
}

                })
                .catch((error) =>
                  console.error("Error fetching cart count:", error)
                );

              attachRemoveItemEvents();
              attachQuantityUpdateEvents();
              initTabSwitcher(".cart-drawer-tab", ".drawer-tab-content");
              addTocart();
              openCartDrawer();
              removeCartDrawer();

              // Ensure tabs are initialized after content is updated
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
                   document.querySelector(".cartcountnum").textContent = `(${data.item_count || 0})`;
                   
                  } else {
                    updateCartDrawer();
                  }
                })
                .catch((error) => console.error("Error removing item:", error));
            });
          });
        }

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

              let form = this.closest("form");
              let formData = new FormData(form);

              const quantityPicker = document.querySelector(
                "quantity-picker input[name='quantity']"
              );
              if (quantityPicker) {
                let quantity = 1;
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

        // Close cart drawer when clicking outside of it
        document.addEventListener("click", function (event) {
          if (
            cartDrawer.classList.contains("open") &&
            !cartDrawer.contains(event.target) &&
            !sideCart.contains(event.target)
          ) {
            closeCartDrawer();
          }
        });

        // Initialize event listeners on page load
        attachRemoveItemEvents();
        attachQuantityUpdateEvents();
      });
    };
  }
  customElements.define("cart-drawer", cartDrawer);
}
