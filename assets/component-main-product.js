// Constants and Configuration
const CONFIG = {
  STOCK_LEVELS: {
    LOW: 10,
    MEDIUM: 20,
    MAX: 50
  },
  STOCK_COLORS: {
    LOW: '#ff5f5f',
    MEDIUM: '#F44336',
    HIGH: '#4caf50'
  },
  DELIVERY_DEFAULTS: {
    START: 2,
    END: 4
  }
};

// Utility Functions
const utils = {
  formatDate: (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  calculateDeliveryDateRange: (startOffset = CONFIG.DELIVERY_DEFAULTS.START, endOffset = CONFIG.DELIVERY_DEFAULTS.END) => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    startDate.setDate(today.getDate() + startOffset);
    endDate.setDate(today.getDate() + endOffset);

    return `${utils.formatDate(startDate)} - ${utils.formatDate(endDate)}`;
  },

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Product Variant Management
class ProductVariantManager {
  constructor() {
    this.variantElements = {
      productVariant: document.querySelector('.product-variant-id'),
      stickyVariant: document.querySelector('.sticky-details-wrapper .product-variant-id'),
      priceDetails: document.querySelector('.price__sale'),
      skuContent: document.querySelector('.sku-content'),
      stockCount: document.querySelector('#stock-count'),
      stockContent: document.querySelector('.stock-indicator'),
      inStockLabel: document.querySelector('.pro-status-message'),
      atcBtnContent: document.querySelector('.atcbtn-content .atcbtn-text'),
      atcButton: document.querySelector('.product-form__submit.atc-btn'),
      stockBarContainer: document.querySelector('.stock-bar-container'),
      stockText: document.querySelector('.stock-indicator p'),
      stickyBtnContent: document.querySelector('.sticky-details-wrapper .atcbtn-content .atcbtn-text'),
      stickyButton: document.querySelector('.sticky-details-wrapper .product-form__submit.atc-btn'),
      stickyVariantChange: document.querySelector('.sticky-details-wrapper .select-variant'),
      checkoutBtn: document.querySelector('.checkoutbtn-text')
    };
  }

  updateVariantUI(variantStock, combinedVariant) {
    const {
      atcBtnContent,
      atcButton,
      stockText,
      checkoutBtn,
      stockBarContainer,
      stockContent,
      inStockLabel,
      stickyBtnContent,
      stickyButton
    } = this.variantElements;

    if (variantStock === 0) {
      this.handleOutOfStock(atcBtnContent, atcButton, stockText, checkoutBtn, stockBarContainer, stockContent, inStockLabel, stickyBtnContent, stickyButton);
    } else {
      this.handleInStock(atcBtnContent, atcButton, stockText, checkoutBtn, stockBarContainer, stockContent, inStockLabel, stickyBtnContent, stickyButton);
    }

    this.updateStockBar(variantStock);
    this.updateSoldMessage();
    this.updateUnavailableOptions(combinedVariant);
  }

  handleOutOfStock(...elements) {
    const [atcBtnContent, atcButton, stockText, checkoutBtn, stockBarContainer, stockContent, inStockLabel, stickyBtnContent, stickyButton] = elements;
    
    if (inStockLabel) inStockLabel.textContent = 'OUT OF STOCK';
    if (atcBtnContent) {
      atcBtnContent.textContent = 'Sold Out';
      atcBtnContent.classList.remove('effect-text');
    }
    if (atcButton) atcButton.setAttribute('disabled', 'disabled');
    if (stockText) stockText.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    if (stockBarContainer) stockBarContainer.style.display = 'none';
    
    this.addOutOfStockMessage(stockContent);
    
    if (stickyBtnContent) {
      stickyBtnContent.textContent = 'Sold Out';
      stickyBtnContent.classList.remove('effect-text');
    }
    if (stickyButton) stickyButton.setAttribute('disabled', 'disabled');
  }

  handleInStock(...elements) {
    const [atcBtnContent, atcButton, stockText, checkoutBtn, stockBarContainer, stockContent, inStockLabel, stickyBtnContent, stickyButton] = elements;
    
    if (inStockLabel) inStockLabel.textContent = 'In stock';
    if (atcBtnContent) {
      atcBtnContent.textContent = 'Add to Cart';
      atcBtnContent.classList.add('effect-text');
    }
    if (atcButton) atcButton.removeAttribute('disabled');
    if (stockText) stockText.style.display = 'block';
    if (stockBarContainer) stockBarContainer.style.display = 'block';
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    
    const outOfStockDiv = document.querySelector('.out-of-stock-message');
    if (outOfStockDiv) outOfStockDiv.remove();
    
    if (stickyBtnContent) {
      stickyBtnContent.textContent = 'Add to Cart';
      stickyBtnContent.classList.add('effect-text');
    }
    if (stickyButton) stickyButton.removeAttribute('disabled');
  }

  updateStockBar(currentStock) {
    const stockBarElement = document.getElementById('stock-bar');
    if (!stockBarElement) return;

    const stockPercentage = (currentStock / CONFIG.STOCK_LEVELS.MAX) * 100;
    stockBarElement.style.width = `${stockPercentage}%`;

    let color = CONFIG.STOCK_COLORS.HIGH;
    if (currentStock <= CONFIG.STOCK_LEVELS.LOW) {
      color = CONFIG.STOCK_COLORS.LOW;
    } else if (currentStock <= CONFIG.STOCK_LEVELS.MEDIUM) {
      color = CONFIG.STOCK_COLORS.MEDIUM;
    }
    stockBarElement.style.backgroundColor = color;
  }

  updateSoldMessage() {
    const soldMessage = document.getElementById('sold-message');
    if (!soldMessage) return;

    const minSold = parseInt(soldMessage.dataset.minSold, 10);
    const maxSold = parseInt(soldMessage.dataset.maxSold, 10);
    const hours = soldMessage.dataset.hours;

    const randomSold = Math.floor(Math.random() * (maxSold - minSold + 1)) + minSold;
    soldMessage.innerHTML = `<span class="prosold-text">${randomSold} products sold</span><span class="lasthours-text"> in the last ${hours} hours.</span>`;
  }

  addOutOfStockMessage(stockContent) {
    if (!stockContent || document.querySelector('.out-of-stock-message')) return;
    
    const outOfStockDiv = document.createElement('div');
    outOfStockDiv.className = 'out-of-stock-message';
    outOfStockDiv.textContent = 'Out of Stock';
    stockContent.appendChild(outOfStockDiv);
  }
}

// Cart Management
class CartManager {
  constructor() {
    this.cartDrawer = document.getElementById('cart-drawer');
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.querySelectorAll('.cart-remove-link').forEach(button => {
      button.addEventListener('click', this.handleRemoveItem.bind(this));
    });

    document.querySelectorAll('#cart-drawer .qnt-input').forEach(button => {
      button.addEventListener('click', this.handleQuantityUpdate.bind(this));
    });

    document.querySelectorAll('.productadd-drawer').forEach(button => {
      button.addEventListener('click', this.handleAddToCart.bind(this));
    });
  }

  async handleRemoveItem(event) {
    event.preventDefault();
    const lineIndex = event.target.getAttribute('data-line');
    if (!lineIndex) return;

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: parseInt(lineIndex),
          quantity: 0,
        }),
      });
      const data = await response.json();
      
      if (data.item_count === 0) {
        this.showEmptyCart();
      } else {
        this.updateCartDrawer();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  showEmptyCart() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;
    
    cartItems.innerHTML = `
      <div class="empty-cart">
        <h1 class="h3">Hmm... looks like your bag is empty.</h1>
        <a href="/collections/all" class="btn btn-secondary">
          Continue shopping
        </a>
      </div>
    `;
  }

  async updateCartDrawer() {
    try {
      const response = await fetch('/?sections=cart-drawer');
      const data = await response.json();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(data['cart-drawer'], 'text/html');
      
      this.updateCartContent(doc);
      await this.updateCartCount();
      
      this.setupEventListeners();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  updateCartContent(doc) {
    const updatedCartDrawer = doc.querySelector('#cart-drawer');
    const cartDrawer = document.querySelector('#cart-drawer');
    if (updatedCartDrawer && cartDrawer) {
      cartDrawer.innerHTML = updatedCartDrawer.innerHTML;
    }

    const updatedTotalPrice = doc.querySelector('.totals__total-value');
    if (updatedTotalPrice) {
      document.querySelector('.totals__total-value').innerHTML = updatedTotalPrice.innerHTML;
    }
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const headerCartCount = document.querySelector('[data-cart-count]');
      const drawerCartCount = document.querySelector('[data-cartdrawer-count]');

      if (headerCartCount) headerCartCount.textContent = `${cart.item_count}`;
      if (drawerCartCount) drawerCartCount.textContent = `(${cart.item_count})`;

      if (cart.item_count > 0 && !this.cartDrawer.classList.contains('open')) {
        this.openCartDrawer();
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  }
}

// Initialize on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
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

  // Initialize managers
  const variantManager = new ProductVariantManager();
  const cartManager = new CartManager();

  // Setup delivery date display
  const deliveryElement = document.getElementById('estimated-delivery');
  if (deliveryElement) {
    const startOffset = parseInt(deliveryElement.getAttribute('data-start')) || CONFIG.DELIVERY_DEFAULTS.START;
    const endOffset = parseInt(deliveryElement.getAttribute('data-end')) || CONFIG.DELIVERY_DEFAULTS.END;
    const deliveryDateRange = utils.calculateDeliveryDateRange(startOffset, endOffset);
    const estimatedText = document.querySelector('.delivery-text')?.getAttribute('data-text') || '';

    deliveryElement.innerHTML = `
      <span class="estimated-text">${estimatedText}</span>
      <span class="delivery-date-range"> ${deliveryDateRange}</span>
    `;
  }

  // Setup social share copy
  window.CopyTolink = function(inputId) {
    const inputField = document.getElementById(inputId);
    const urlToCopy = inputField.getAttribute('data-url');
    
    navigator.clipboard.writeText(urlToCopy)
      .then(() => {
        inputField.value = 'Link copied to clipboard!';
        setTimeout(() => {
          inputField.value = urlToCopy;
        }, 2000);
      })
      .catch(error => {
        console.error('Failed to copy: ', error);
      });
  };

  // Setup variant change handlers
  document.querySelectorAll('.color-variant, .multiple-option-variant').forEach(element => {
    element.addEventListener('click', () => handleVariantChange(element));
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleVariantChange(element);
    });
  });

  // Setup sticky cart
  setupStickyCart();

  // Setup popup handling
  setupPopupHandling();
});

// Helper Functions
function handleVariantChange(element) {
  const parentFieldset = element.closest('fieldset');
  if (parentFieldset) {
    parentFieldset.querySelectorAll('.checked').forEach(el => el.classList.remove('checked'));
  }

  const selectedValue = element.dataset.color?.toLowerCase();
  const swiperSlides = document.querySelectorAll('.media-item');
  const swiperInstance = window.mainSwiper;

  let matchedSlideIndex = -1;
  swiperSlides.forEach((slide, index) => {
    const img = slide.querySelector('img.variant-image');
    if (img && img.dataset.variant.toLowerCase() === selectedValue) {
      matchedSlideIndex = index;
    }
  });

  if (matchedSlideIndex !== -1 && swiperInstance) {
    swiperInstance.slideTo(matchedSlideIndex);
  }

  element.classList.add('checked');
  getCombinedVariant();
}

function setupStickyCart() {
  const target = document.querySelector('.product-block.block-buy_button');
  const stickyCart = document.querySelector('.sticky-content');
  const stickyContent = document.querySelector('sticky-cart');
  const footerPrivacy = document.querySelector('.privacy-policy-text');

  if (!target || !stickyCart || !stickyContent || !footerPrivacy) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const isStickyHidden = entries.some(entry => 
        (entry.target === target || entry.target === footerPrivacy) && entry.isIntersecting
      );

      stickyCart.classList.toggle('active', !isStickyHidden);
      stickyContent.setAttribute('aria-hidden', isStickyHidden ? 'false' : 'true');
    },
    { threshold: 0.1 }
  );

  observer.observe(target);
  observer.observe(footerPrivacy);
}

function setupPopupHandling() {
  const pswpElement = document.querySelector('.pswp');
  if (!pswpElement) return;

  const observer = new MutationObserver(() => {
    document.body.classList.toggle('pswp-popup-body', pswpElement.classList.contains('pswp--open'));
  });

  observer.observe(pswpElement, {
    attributes: true,
    attributeFilter: ['class']
  });
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