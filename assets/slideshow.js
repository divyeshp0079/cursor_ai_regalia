theme.slideShow = () => {
  const collectionlistEle = document.querySelector(".slidercontent");
  if (!collectionlistEle) return;

  const swiperOptions = JSON.parse(collectionlistEle.dataset.sliderOptions);

  swiperOptions.pagination.renderBullet = renderPaginationBullet;

  const swiper = new Swiper(collectionlistEle, swiperOptions);

  if (Shopify.designMode) {
    document.addEventListener("shopify:block:select", (e) => {
      let targetEle = e.target;
      let sliderIndex = 1 + parseInt(targetEle.dataset.swiperSlideIndex);
      swiper.slideTo(sliderIndex);
      swiper.autoplay.stop(); 
    });

    const customizationEvents = [
      "shopify:inspector:activate",
      "shopify:inspector:deactivate",
      "shopify:section:load",
      "shopify:block:deselect",
      "shopify:section:reorder",
      "shopify:section:select",
      "shopify:section:deselect",
    ];

    customizationEvents.forEach((event) => {
      document.addEventListener(event, () => swiper.update());
    });
  }

function calculateMaxImageHeight() {
  const images = document.querySelectorAll('.slidercontent .sliderimg img');
  let maxHeight = 0;

  images.forEach((img) => {
    maxHeight = Math.max(maxHeight, img.clientHeight);
  });

  document.querySelectorAll('.sliderimg').forEach((slide) => {
    slide.style.height = `${maxHeight}px`;
  });
}

function setSwiperMinHeight() {
  const images = document.querySelectorAll('.slidercontent .sliderimg img');
  let loadedCount = 0;

  if (images.length === 0) return;

  images.forEach((img) => {
    if (img.complete) {
      loadedCount++;
    } else {
      img.addEventListener('load', () => {
        loadedCount++;
        if (loadedCount === images.length) {
          calculateMaxImageHeight();
        }
      });
    }
  });

  // If all images were already loaded
  if (loadedCount === images.length) {
    calculateMaxImageHeight();
  }
}

setSwiperMinHeight();
window.addEventListener('resize', calculateMaxImageHeight); 
};

window.addEventListener("DOMContentLoaded", () => {
  theme.slideShow();
});

// Function to render custom pagination bullets
function renderPaginationBullet(index, className) {
  const slide = document.querySelectorAll(".sliderimg")[index];
  const image = slide.getAttribute("data-image");

  // Render the bullet with a background image based on the data-image attribute
  return `<div class="${className}"><img src="${image}" alt="Slide thumbnail" /></div>`;
}
