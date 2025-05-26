theme.featuredCollectionList = () => {
  let featuredCollectionListEle = document.querySelectorAll(
    ".col-content.swiper"
  );

  featuredCollectionListEle.forEach((current) => {
    let swiperOptions;

    try {
      swiperOptions = JSON.parse(current.dataset.sliderOptions);
    } catch (error) {
      console.error("Error parsing swiper options: ", error);
      return;
    }

    let swiper = new Swiper(current, swiperOptions);

    if (swiperOptions.autoplay) {
      current.addEventListener("mouseover", () => {
        if (swiper.autoplay) {
          swiper.autoplay.stop();
        }
      });

      current.addEventListener("mouseleave", () => {
        if (swiper.autoplay) {
          swiper.autoplay.start();
        }
      });
    }

    if (Shopify.designMode) {
      document.addEventListener("shopify:block:select", (e) => {
        let targetEle = e.target;
        let sliderIndex = 1 + parseInt(targetEle.dataset.swiperSlideIndex || 0);
        swiper.slideTo(sliderIndex);
        if (swiper.autoplay) swiper.autoplay.stop();
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
        document.addEventListener(event, () => {
          if (swiper) swiper.destroy(true, true);
          swiper = new Swiper(current, swiperOptions);
        });
      });
    }
  });
};

window.addEventListener("DOMContentLoaded", () => {
  theme.featuredCollectionList();
});
