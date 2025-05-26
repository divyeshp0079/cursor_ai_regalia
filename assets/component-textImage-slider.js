theme.textImageSlider = () => {
  let textImageSliderEle = document.querySelectorAll(
    ".text-image-wrapper.swiper"
  );

  textImageSliderEle.forEach((current) => {
    let swiperOptions = JSON.parse(current.dataset.sliderOptions);
    let swiper = new Swiper(current, swiperOptions); // Use `let` to prevent accidental global assignment

    current.addEventListener("mouseover", () => {
      swiper.autoplay.stop();
    });
    current.addEventListener("mouseleave", () => {
      swiper.autoplay.start();
    });

    // pause announcement bar on block select
    if (Shopify.designMode) {
      document.addEventListener("shopify:block:select", (e) => {
        let shopifyData = JSON.parse(e.target.dataset.shopifyEditorBlock),
          targetEle = e.target,
          sliderIndex = 1 + parseInt(targetEle.dataset.swiperSlideIndex);
        swiper.slideTo(sliderIndex);
        swiper.autoplay.stop();
      });

      // Deduplicated customization events
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
};

window.addEventListener("DOMContentLoaded", () => {
  theme.textImageSlider();
});
