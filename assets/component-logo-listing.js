theme.logoList = () => {
  const logoListEle = document.querySelectorAll(".logo-list-slider.swiper");

  const customizationEvents = [
    "shopify:inspector:activate",
    "shopify:inspector:deactivate",
    "shopify:section:load",
    "shopify:block:deselect",
    "shopify:section:reorder",
    "shopify:section:select",
    "shopify:section:deselect"
  ];

  const swipers = [];

  logoListEle.forEach((current) => {
    const swiperOptions = JSON.parse(current.dataset.sliderOptions);
    const swiper = new Swiper(current, swiperOptions);
    swipers.push({ swiper, swiperOptions, current });

    current.addEventListener("mouseover", () => {
      swiper.autoplay.stop();
    });

    current.addEventListener("mouseleave", () => {
      swiper.autoplay.start();
    });
  });

  if (Shopify.designMode) {
    // Block select: handle only when relevant
    document.addEventListener("shopify:block:select", (e) => {
      const targetEle = e.target;
      const swiperSlideIndex = parseInt(targetEle.dataset.swiperSlideIndex);
      const sliderIndex = 1 + (isNaN(swiperSlideIndex) ? 0 : swiperSlideIndex);

      swipers.forEach(({ swiper }) => {
        swiper.slideTo(sliderIndex);
        swiper.autoplay.stop();
      });
    });

    // Shopify customization events
    const throttledInit = throttle(() => {
      swipers.forEach(({ swiper, swiperOptions }) => swiper.init(swiperOptions));
    }, 100);

    customizationEvents.forEach((event) => {
      document.addEventListener(event, throttledInit);
    });
  }

  // Simple throttle utility
  function throttle(fn, delay) {
    let timer = null;
    return function (...args) {
      if (!timer) {
        timer = setTimeout(() => {
          fn.apply(this, args);
          timer = null;
        }, delay);
      }
    };
  }
};

window.addEventListener("DOMContentLoaded", () => {
  theme.logoList();
});
