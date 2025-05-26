theme.testimonialSlider = () => {
  let testimonialEle = document.querySelectorAll(
    ".testimonial-items-wrapper.swiper"
  );

  testimonialEle.forEach((current) => {
    let swiperOptions = JSON.parse(current.dataset.sliderOptions);

    // Add custom event hooks
    swiperOptions.on = {
      init(swiper) {
        setSwiperMaxHeight(swiper);
      },
      slideChange(swiper) {
        setSwiperMaxHeight(swiper);
      },
      resize(swiper) {
        setSwiperMaxHeight(swiper);
      },
    };

    const swiper = new Swiper(current, swiperOptions);

    current.addEventListener("mouseover", () => {
      swiper.autoplay?.stop();
    });

    current.addEventListener("mouseleave", () => {
      swiper.autoplay?.start();
    });

    // pause on block select in editor
    if (Shopify.designMode) {
      document.addEventListener("shopify:block:select", (e) => {
        let shopifyData = JSON.parse(e.target.dataset.shopifyEditorBlock),
          targetEle = e.target,
          sliderIndex = 1 + parseInt(targetEle.dataset.swiperSlideIndex);
        swiper.slideTo(sliderIndex);
        swiper.autoplay?.stop();
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
        document.addEventListener(event, () => swiper.init(swiperOptions));
      });
    }
  });

  // Helper function to set all slide heights equal to tallest
  function setSwiperMaxHeight(swiper) {
    let maxHeight = 0;
    swiper.slides.forEach((slide) => {
      slide.style.height = "auto";
      const slideHeight = slide.offsetHeight;
      if (slideHeight > maxHeight) {
        maxHeight = slideHeight;
      }
    });
    swiper.slides.forEach((slide) => {
      slide.style.height = `${maxHeight}px`;
    });
  }
};

window.addEventListener("DOMContentLoaded", () => {
  theme.testimonialSlider();
});
