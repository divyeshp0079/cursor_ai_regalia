document.addEventListener("DOMContentLoaded", function () {
  const storeAddresses = document.querySelectorAll(".store-address");
  const storeMaps = document.querySelectorAll(".store-map");

  if (storeAddresses.length > 0) {
    storeAddresses[0].classList.add("active");
    if (storeMaps.length > 0) {
      storeMaps[0].style.display = "block";
    }
  }

  storeAddresses.forEach((address) => {
    address.addEventListener("click", function () {
      storeAddresses.forEach((btn) => btn.classList.remove("active"));
      storeMaps.forEach((map) => (map.style.display = "none"));

      address.classList.add("active");
      const addressId = address.getAttribute("data-address");
      document.getElementById(addressId).style.display = "block";
    });
  });
});
