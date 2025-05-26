let swiperInstance = null;

function initializeSwiper() {
  if (window.innerWidth < 768) {
    if (!swiperInstance) {
      swiperInstance = new Swiper(".featured-blog-swiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoHeight: true,
      });
    }
  } else {
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
  }
}

initializeSwiper();

window.addEventListener("resize", initializeSwiper);
