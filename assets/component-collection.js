document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.sortby-value').forEach((sortby) => {
      sortby.addEventListener('click', function (event) {
          document.querySelectorAll('.sortby-value').forEach(btn => btn.classList.remove('activeOption'));
          this.classList.add('activeOption');
          setTimeout(() => {
              const sortTopheader = document.querySelector(".sortbycontent");
              if (sortTopheader) {
                  sortTopheader.classList.remove("dropdown");
              }
          }, 700);
          const sortByValue = this.getAttribute('value'); // Get selected sorting value
          const currentUrl = new URL(window.location.href); // Get current URL
          const text = this.innerHTML;
          document.querySelector('.sortby-page').innerHTML = text;
          currentUrl.searchParams.set("sort_by", sortByValue);
          history.pushState({}, "", currentUrl); // Change URL without refresh

          fetch(`${currentUrl.pathname}?section_id=main-collection&${currentUrl.searchParams}`)
              .then(response => response.text())
              .then(html => {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, "text/html");
                  const newContent = doc.getElementById("collection-container");
                  if (newContent) {
                      document.getElementById("collection-container").innerHTML = newContent.innerHTML;
                  }
              })
              .catch(error => console.error("Error loading products:", error));
          event.stopPropagation();
      });
  });
  // Click outside handler to remove 'dropdown' class
  document.addEventListener("click", function (event) {
      const sortTopheader = document.querySelector(".sortbycontent");
      if (sortTopheader && !sortTopheader.contains(event.target)) {
          sortTopheader.classList.remove("dropdown");
      }
  });
});
document.addEventListener("DOMContentLoaded", function () {
const sortByHeader = document.querySelector(".sortby-header");
if (sortByHeader) {
  sortByHeader.addEventListener("click", function () {
      const sortOption = document.querySelector(".sortbycontent");

      sortOption.classList.toggle("dropdown");
  });
}
});
// update price range FileSystemEntry
document.addEventListener("DOMContentLoaded", () => {
const rangeInput = document.querySelectorAll(".range-input input"),
      priceInput = document.querySelectorAll(".price-input input"),
      progressBar = document.querySelector(".slider .progress");
rangeInput[0].min = 0;  // Set min value to 0 for the first range input
priceInput[0].min = 0;  // Set min value to 0 for the first price input
function updateProgress() {
  const minVal = parseInt(rangeInput[0].value),
        maxVal = parseInt(rangeInput[1].value),
        minLimit = 0,
        maxLimit = parseInt(rangeInput[1].max);
  progressBar.style.left = ((minVal - minLimit) / (maxLimit - minLimit)) * 100 + "%";
  progressBar.style.right = 100 - ((maxVal - minLimit) / (maxLimit - minLimit)) * 100 + "%";
}
function filterProductsByPrice(minPrice, maxPrice) {
  const productItems = document.querySelectorAll(".product-item");
  productItems.forEach(item => {
    const priceElement = item.querySelector("[data-price]");
    if (priceElement) {
      const price = parseFloat(priceElement.textContent.replace(/[^0-9\.]/g, ""));
      item.style.display = (price >= minPrice && price <= maxPrice) ? "" : "none";
    }
  });
}
function updatePriceRangeURL(minPrice, maxPrice) {
  const url = new URL(window.location);
  url.searchParams.set("filter.v.price.gte", minPrice);
  url.searchParams.set("filter.v.price.lte", maxPrice);
  window.history.pushState({}, "", url);
}
priceInput.forEach((input) => {
  input.addEventListener("input", () => {
    const minPrice = parseInt(priceInput[0].value),
          maxPrice = parseInt(priceInput[1].value);
    rangeInput[0].value = minPrice;
    rangeInput[1].value = maxPrice;
    updateProgress();
    filterProductsByPrice(minPrice, maxPrice);
    updatePriceRangeURL(minPrice, maxPrice);
  });
});
rangeInput.forEach((input) => {
  input.addEventListener("input", () => {
    let minVal = parseInt(rangeInput[0].value),
        maxVal = parseInt(rangeInput[1].value),
        maxLimit = parseInt(rangeInput[1].max);
    if (maxVal >= maxLimit - 1) {
      maxVal = maxLimit;
      rangeInput[1].value = maxLimit;
    }
    priceInput[0].value = minVal;
    priceInput[1].value = maxVal;
    updateProgress();
    filterProductsByPrice(minVal, maxVal);
    updatePriceRangeURL(minVal, maxVal);
  });
});
updateProgress();
filterProductsByPrice(parseInt(priceInput[0].value), parseInt(priceInput[1].value));
});

document.addEventListener("DOMContentLoaded", function () {
  // Selectors
  const availabilityCheckboxes = document.querySelectorAll(".availability-filter .checkbox-content");
  const brandCheckboxes = document.querySelectorAll(".filter_brand .checkbox-content");
  const tagCheckboxes = document.querySelectorAll(".sb-widget .checkbox-content");
  const colorButtons = document.querySelectorAll(".color-filter input[data-color]");
  const filterListDiv = document.querySelector(".applied-filter-list");
  const productContainer = document.querySelector(".collection-grid-wrapper");
  
  // Clear buttons
  const clearAvailabilityButton = document.querySelector(".clear-availability-filter");
  const clearColorButton = document.querySelector(".clear-color-filter");
  const clearBrandButton = document.querySelector(".clear-brand-filter");
  const clearTagButtons = document.querySelectorAll(".clear-tag-filter");

  // No products message
  const noProductsMessage = document.createElement("div");
  noProductsMessage.textContent = "Sorry, no products match the selected filters.";
  noProductsMessage.classList.add("no-products-message");
  noProductsMessage.style.display = "none";
  noProductsMessage.style.textAlign = "center";
  noProductsMessage.style.padding = "2%";
  productContainer.appendChild(noProductsMessage);


  // Toggle clear button visibility
  const toggleClearButtonVisibility = () => {
      clearAvailabilityButton.style.display = document.querySelector(".availability-filter input[value='in_stock']:checked") || document.querySelector(".availability-filter input[value='out_of_stock']:checked") ? 'block' : 'none';
      if (clearColorButton) {
          clearColorButton.style.display = Array.from(colorButtons).some(button => button.classList.contains("selected")) ? 'block' : 'none';
      }
      clearBrandButton.style.display = Array.from(brandCheckboxes).some(checkbox => checkbox.checked) ? 'block' : 'none';
      clearTagButtons.forEach(button => {
          const category = button.getAttribute("data-category");
          const isChecked = Array.from(tagCheckboxes).some(checkbox => checkbox.name === category && checkbox.checked);
          button.style.display = isChecked ? 'block' : 'none';
      });
  };

  // Event Listeners
  addEventListeners();

  // Initial setup
  toggleClearButtonVisibility();
  applyURLFilters();
  updateFilterList();

  function addEventListeners() {
      // Clear buttons
      if (clearAvailabilityButton) {
          clearAvailabilityButton.addEventListener("click", clearAvailabilityFilters);
      }
      if (clearColorButton) {
          clearColorButton.addEventListener("click", clearColorFilters);
      }
      if (clearBrandButton) {
          clearBrandButton.addEventListener("click", clearBrandFilters);
      }
      clearTagButtons.forEach(button => {
          button.addEventListener("click", clearTagFilters);
      });

      // Filter change events
      availabilityCheckboxes.forEach(checkbox => checkbox.addEventListener("change", handleFilterChange));
      brandCheckboxes.forEach(checkbox => checkbox.addEventListener("change", handleFilterChange));
      tagCheckboxes.forEach(checkbox => checkbox.addEventListener("change", handleFilterChange));
      colorButtons.forEach(button => button.addEventListener("click", handleColorFilterChange));
  }

  // Clear filter functions
  function clearAvailabilityFilters() {
      document.querySelector(".availability-filter input[value='in_stock']").checked = false;
      document.querySelector(".availability-filter input[value='out_of_stock']").checked = false;
      updateFilters();
  }

  function clearColorFilters() {
      colorButtons.forEach(button => button.classList.remove("selected"));
      updateFilters();
  }

  function clearBrandFilters() {
      brandCheckboxes.forEach(checkbox => checkbox.checked = false);
      updateFilters();
  }

  function clearTagFilters(event) {
      const category = event.currentTarget.getAttribute("data-category");
      tagCheckboxes.forEach(checkbox => {
          if (checkbox.name === category) {
              checkbox.checked = false;
          }
      });
      updateFilters();
  }

  // Handle filter changes
  function handleFilterChange() {
      updateFilters();
  }

  function handleColorFilterChange() {
      this.classList.toggle("selected");
      updateFilters();
  }

  function updateFilters() {
      updateURLParams();
      filterProducts();
      toggleClearButtonVisibility();
      updateFilterList();
  }

  // Update filter list UI
  function updateFilterList() {
      filterListDiv.innerHTML = "";
      const selectedAvailability = [];
      if (document.querySelector(".availability-filter input[value='in_stock']").checked) selectedAvailability.push('In Stock');
      if (document.querySelector(".availability-filter input[value='out_of_stock']").checked) selectedAvailability.push('Out of Stock');
      const selectedBrands = Array.from(document.querySelectorAll(".filter_brand input:checked")).map(checkbox => checkbox.value);
      const selectedTags = Array.from(document.querySelectorAll(".sb-widget input:checked")).map(checkbox => checkbox.value);
      const selectedColors = Array.from(document.querySelectorAll(".color-filter input.selected")).map(button => button.dataset.color);

      selectedAvailability.forEach(filter => addFilterToList(filter, 'availability'));
      selectedBrands.forEach(filter => addFilterToList(filter, 'brand'));
      selectedTags.forEach(filter => addFilterToList(filter, 'tag'));
      selectedColors.forEach(filter => addFilterToList(filter, 'color'));

      if (selectedAvailability.length || selectedBrands.length || selectedTags.length || selectedColors.length) {
          filterListDiv.style.display = "flex";
          filterListDiv.style.alignItems = "center";
          const clearAllFilters = document.createElement("a");
          clearAllFilters.href = "#";
          clearAllFilters.classList.add("clear-all-filters");
          clearAllFilters.textContent = "Clear All";
          clearAllFilters.addEventListener("click", function (e) {
              e.preventDefault();
              clearAllFiltersFunction();
          });
          filterListDiv.appendChild(clearAllFilters);
      } else {
          filterListDiv.style.display = "none";
      }
  }

  // Clear all filters
  function clearAllFiltersFunction() {
      document.querySelectorAll(".availability-filter input").forEach(input => input.checked = false);
      document.querySelectorAll(".filter_brand input").forEach(input => input.checked = false);
      document.querySelectorAll(".sb-widget input").forEach(input => input.checked = false);
      document.querySelectorAll(".color-filter input").forEach(button => button.classList.remove("selected"));
      updateFilters();
  }

  // Add filter to list
  function addFilterToList(filter, type) {
      const filterItem = document.createElement("div");
      filterItem.classList.add("filter-item");
      filterItem.textContent = filter.charAt(0).toUpperCase() + filter.slice(1);
      const removeButton = document.createElement("span");
      removeButton.textContent = "✖";
      removeButton.classList.add("remove-filter");
      removeButton.addEventListener("click", function () {
          removeFilter(filter, type);
          updateFilterList();
      });
      filterItem.appendChild(removeButton);
      filterListDiv.appendChild(filterItem);
  }

  // Remove filter
  function removeFilter(filter, type) {
      if (type === 'availability') {
          if (filter === 'In Stock') document.querySelector(".availability-filter input[value='in_stock']").checked = false;
          if (filter === 'Out of Stock') document.querySelector(".availability-filter input[value='out_of_stock']").checked = false;
      } else if (type === 'brand') {
          const checkbox = Array.from(brandCheckboxes).find(checkbox => checkbox.value === filter);
          if (checkbox) checkbox.checked = false;
      } else if (type === 'tag') {
          const checkbox = Array.from(tagCheckboxes).find(checkbox => checkbox.value === filter);
          if (checkbox) checkbox.checked = false;
      } else if (type === 'color') {
          const button = Array.from(colorButtons).find(button => button.dataset.color === filter);
          if (button) button.classList.remove("selected");
      }
      updateFilters();
  }

  // URL handling
  function applyURLFilters() {
      const urlParams = new URLSearchParams(window.location.search);
      const inStockParam = urlParams.get("in_stock");
      const outOfStockParam = urlParams.get("out_of_stock");
      if (inStockParam === "true") document.querySelector(".availability-filter input[value='in_stock']").checked = true;
      if (outOfStockParam === "true") document.querySelector(".availability-filter input[value='out_of_stock']").checked = true;

      const selectedBrands = urlParams.get("brands")?.split(",") || [];
      brandCheckboxes.forEach(checkbox => {
          if (selectedBrands.includes(checkbox.value)) {
              checkbox.checked = true;
              clearBrandButton.style.display = 'block';
          }
      });

      tagCheckboxes.forEach(checkbox => {
          const selectedTags = urlParams.get("tags")?.split(",") || [];
          if (selectedTags.includes(checkbox.value)) {
              checkbox.checked = true;
          }
      });

      const selectedColors = urlParams.get("colors")?.split(",") || [];
      colorButtons.forEach(button => {
          const color = button.dataset.color;
          if (selectedColors.includes(color)) {
              button.classList.add("selected");
          }
      });

      filterProducts();
      toggleClearButtonVisibility();
  }

  function updateURLParams() {
      const urlParams = new URLSearchParams();
      const inStockChecked = document.querySelector(".availability-filter input[value='in_stock']").checked;
      const outOfStockChecked = document.querySelector(".availability-filter input[value='out_of_stock']").checked;
      if (inStockChecked) urlParams.set("in_stock", "true");
      if (outOfStockChecked) urlParams.set("out_of_stock", "true");

      const selectedBrands = Array.from(document.querySelectorAll(".filter_brand input:checked")).map(checkbox => checkbox.value);
      if (selectedBrands.length > 0) {
          urlParams.set("brands", selectedBrands.join(","));
      }

      const selectedTags = Array.from(document.querySelectorAll(".sb-widget input:checked")).map(checkbox => checkbox.value);
      if (selectedTags.length > 0) {
          urlParams.set("tags", selectedTags.join(","));
      }

      const selectedColorElements = document.querySelectorAll(".color-filter input.selected");
      const selectedColors = Array.from(selectedColorElements).map(button => button.dataset.color);
      if (selectedColors.length > 0) {
          urlParams.set("colors", selectedColors.join(","));
      } else {
          urlParams.delete("colors");
      }

      history.replaceState(null, "", "?" + urlParams.toString());
  }

  // Filter products based on selected filters
  function filterProducts() {
      let visibleCount = 0;
      const products = document.querySelectorAll(".product-item");

      const inStockChecked = document.querySelector(".availability-filter input[value='in_stock']")?.checked || false;
      const outOfStockChecked = document.querySelector(".availability-filter input[value='out_of_stock']")?.checked || false;
      const selectedBrands = Array.from(document.querySelectorAll(".filter_brand input:checked")).map(checkbox => checkbox.value);
      let selectedFilters = {};
      document.querySelectorAll(".sb-widget input:checked").forEach(checkbox => {
          let category = checkbox.name.toLowerCase();
          let value = checkbox.value.toLowerCase();
          if (!selectedFilters[category]) {
              selectedFilters[category] = [];
          }
          selectedFilters[category].push(value);
      });
      const selectedColorElements = document.querySelectorAll(".color-filter input.selected");
      const selectedColors = Array.from(selectedColorElements).map(button => button.dataset.color.toLowerCase());
    
      products.forEach(product => {
          const isAvailable = product.dataset.available === "true";
          const productBrand = product.getAttribute("brand");
          const tags = product.getAttribute("filter-tags").toLowerCase().split(",");
          const productColors = product.getAttribute("color-variant")?.toLowerCase().split(",") || [];

          const matchesAvailability = (inStockChecked && isAvailable) || (outOfStockChecked && !isAvailable) || (!inStockChecked && !outOfStockChecked);
          const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);
          let matchesTags = Object.keys(selectedFilters).length === 0;
          if (!matchesTags) {
              matchesTags = tags.some(tag => {
                  if (tag.includes("_")) {
                      let [category, value] = tag.split("_");
                      return selectedFilters[category] && selectedFilters[category].includes(value);
                  }
                  return false;
              });
          }
          const matchesColor = selectedColors.length === 0 || selectedColors.some(color => productColors.includes(color));

          if (matchesAvailability && matchesBrand && matchesTags && matchesColor) {
              product.style.display = "";
              visibleCount++;
              console.log("visibleCount",visibleCount);
                          
          } else {
              product.style.display = "none";
          }
      });
    
      // Update no products message
      noProductsMessage.style.display = visibleCount === 0 ? "block" : "none";
  }

});
