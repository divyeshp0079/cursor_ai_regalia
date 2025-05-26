window.theme = window.theme || {};

window.theme.cartQntHandle = () => {
  let qntInputs = document.querySelectorAll('.cart-qnt input[name="quantity"]');
  qntInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      let that = e.currentTarget;
      let inputBtns = that.parentElement.querySelectorAll(".qnt-input");
      let trElement = that.closest("tr");
      if (!trElement) {
        return;
      }
      let currIndex = trElement.dataset.index || 1;
      let maxQuantity = parseInt(that.dataset.max);
      let cartCount = document.querySelector("[data-cart-count]");
      let inputValue = that.value.trim();
      let quantity =
        isNaN(inputValue) || inputValue === ""
          ? 1
          : Math.floor(parseFloat(inputValue));

      if (quantity > maxQuantity) {
        quantity = maxQuantity;
      }

      that.value = quantity;

      // 🧠 ICON TOGGLE LOGIC (moved from separate script)
      const wrapper = that.closest('quantity-picker');
      if (wrapper) {
        const iconMinus = wrapper.querySelector('.icon-minus');
        const iconTrash = wrapper.querySelector('.icon-trash');
        if (iconMinus && iconTrash) {
          if (quantity <= 1) {
            iconMinus.style.display = 'none';
            iconTrash.style.display = 'flex';
          } else {
            iconMinus.style.display = 'flex';
            iconTrash.style.display = 'none';
          }
        }
      }

      inputBtns.forEach((btn) => (btn.disabled = true));

      // update cart
      fetch(window.theme.routes.cart_change_url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ line: currIndex, quantity: quantity }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.errors) {
            that.value = parseInt(that.value) - 1;
            that.closest(".cart-qnt").querySelector(".error").style.display =
              null;
            that
              .closest(".cart-qnt")
              .querySelector("[data-error-text]").textContent = res.errors;
            setTimeout(() => {
              that.closest(".cart-qnt").querySelector(".error").style.display =
                "none";
            }, 2500);
          } else if (that.value < 0) {
            that.closest(".cart-qnt").querySelector(".error").style.display =
              null;
            that
              .closest(".cart-qnt")
              .querySelector("[data-error-text]").textContent =
              theme.cart_qnt_error.replace("{{ quantity }}", res.item_count);
            setTimeout(() => {
              that.closest(".cart-qnt").querySelector(".error").style.display =
                "none";
            }, 2500);
            // update quantity
            that.value = res.item_count;
          } else if (res.item_count == 0) {
            location.reload();
          } else {
            // if (that.value == 0) that.closest('tr').remove()
            cartCount.innerHTML = res.item_count;

            if (res.item_count != 0) {
              cartCount.style.display = null;
            } else {
              cartCount.style.display = "none";
            }
            fetch("/cart.js")
              .then((response) => response.json())
              .then((cart) => {
                let updatedItem = cart.items.find(
                  (item) => item.id === parseInt(that.dataset.id)
                );
                if (updatedItem) {
                  that
                    .closest("tr")
                    .querySelector("[data-total-price]").innerHTML =
                    window.theme.formatMoney(
                      updatedItem.final_line_price,
                      window.theme.money_format
                    );
                }

                document.querySelector("[data-total-cart-price]").innerHTML =
                  window.theme.formatMoney(
                    cart.total_price,
                    window.theme.money_format
                  );

                document.querySelector("[data-orignial-cart-price]").innerHTML =
                  window.theme.formatMoney(
                    cart.original_total_price,
                    window.theme.money_format
                  );

                updateDiscounts(cart);
              });

            let decreaseBtn = that
              .closest(".cart-qnt")
              .querySelector(".qnt-dec");
            let increaseBtn = that
              .closest(".cart-qnt")
              .querySelector(".qnt-inc");

            decreaseBtn.disabled = quantity === 1;
            increaseBtn.disabled = quantity >= maxQuantity;

            theme.onScrollAnimation();
          }
        });
    });
  });
};


function attachRemoveButtonListeners() {
    document.querySelectorAll(".maincart-remove").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();

        const line = this.dataset.line;
        // const itemElement = document.querySelector(`.cart-item[data-line="${line}"]`);
        const itemElement = document.querySelector(`.maincart-remove[data-line="${line}"]`)?.closest(`tr[data-index="${line}"]`);


        fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            line: parseInt(line),
            quantity: 0
          })
        })
        .then(response => response.json())
        .then(cart => {
             if (itemElement) {
            itemElement.remove(); // Remove item visually
          }
               if (cart.item_count === 0) {
                    document.querySelector("#main-cart").innerHTML = `
                      <div class="empty-cart">
                        <h1 class="h3">Hmm... looks like your bag is empty.</h1>
                        <a href="/collections/all" class="btn btn-secondary">
                          Continue shopping
                        </a>
                      </div>
                    `;
                 document.querySelector('.cart-count').textContent = cart.item_count;
          }
        else{
            // // 🧮 Update cart count
          document.querySelector('.cart-count').textContent = cart.item_count;
          fetch("/?sections=main-cart")
            .then((response) => response.json())
            .then((cart) => {
              let cartParser = new DOMParser();
              let doc = cartParser.parseFromString(cart["main-cart"],"text/html");

              // Update total price
              let cartTotalPrice = doc.querySelector("#main-cart .totals__total-value");
              // console.log(cartTotalPrice);
              if (cartTotalPrice) {
                document.querySelector("#main-cart .totals__total-value").innerHTML =
                  cartTotalPrice.innerHTML;
              }
              let cartFinalprice = doc.querySelector("#main-cart .totals__subtotal-value");
              // let priceData = cartFinalprice.getAttribute('data-total-cart-price');
              console.log(cartFinalprice);
              if(cartFinalprice){
                document.querySelector("#main-cart .totals__subtotal-value").innerHTML =
                  cartFinalprice.innerHTML;
              }
              let cartDiscount = doc.querySelector("#main-cart .discount-value"); 
                console.log(cartDiscount);
              if(cartDiscount){
                document.querySelector("#main-cart .discount-value").innerHTML = cartDiscount.innerHTML;
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
                  updateDiscounts(cart)
                })
                .catch((error) =>
                  console.error("Error fetching cart count:", error)
                );
         
              // Ensure tabs are initialized after content is updated
            })
            .catch((error) => console.error("Error updating cart:", error));
          
        }
        
        })
        .catch(error => {
          console.error("Error removing item from cart:", error);
        });
      });
    });
}

function updateDiscounts(cart) {
  let discountHtml = "";

  if (cart.cart_level_discount_applications.length > 0) {
    discountHtml += `<div class="additional-disconts">
          <div class="discounts list-unstyled" role="list" aria-label="Discounts">`;

    cart.cart_level_discount_applications.forEach((discount) => {
      discountHtml += `<div class="discount-wrapper"><div class="discount-title">Discount</div><p class="discounts__discount discounts__discount--position">
              <svg aria-hidden="true" focusable="false" class="icon icon-discount" viewBox="0 0 12 12">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0h3a2 2 0 012 2v3a1 1 0 01-.3.7l-6 6a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l6-6A1 1 0 017 0zm2 2a1 1 0 102 0 1 1 0 00-2 0z" fill="currentColor">
              </svg>
              ${discount.title}
          </p></div>
           <p class="discount-value">${window.theme.formatMoney(
             discount.total_allocated_amount,
             window.theme.money_format
           )}</p>
          `;
    });

    discountHtml += `</div></div>`;
  }

  document.querySelector(".additional-disconts").innerHTML = discountHtml;
}


window.addEventListener("DOMContentLoaded", () => {
  window.theme.cartQntHandle();
  attachRemoveButtonListeners(); // Ensure remove button listeners are attached
});