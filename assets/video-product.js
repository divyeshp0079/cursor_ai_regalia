document.addEventListener("DOMContentLoaded", function () {
  var videoElements = document.querySelectorAll(".video-section__media video");
  videoElements.forEach(function (videoEl) {
    var img = videoEl.querySelector("img");
    if (img) {
      img.setAttribute("alt", "Video preview image");
    }
  });

  let swiperInstance;
  let isMobile = window.innerWidth <= 767;

  function initializeSwiper() {
    if (isMobile && !swiperInstance) {
      swiperInstance = new Swiper(".vidpro-swiper", {
        slidesPerView: 2,
        spaceBetween: 10,
        loop: true,
        grabCursor: true,
        speed: 500,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
      });
    }
  }

  function destroySwiper() {
    if (!isMobile && swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
  }

  initializeSwiper();

  window.addEventListener("resize", function () {
    const newIsMobile = window.innerWidth <= 767;

    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      initializeSwiper();
      destroySwiper();
    }
  });
});
