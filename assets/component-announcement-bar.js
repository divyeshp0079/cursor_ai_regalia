theme.announcementBar = () => {
  let announcementEle = document.querySelectorAll(
    ".announcebar-wrapper.swiper"
  );

  announcementEle.forEach((current) => {
    let swiperOptions = JSON.parse(current.dataset.sliderOptions);
    swiper = new Swiper(current, swiperOptions);

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
      const customizationEvents = [
        "shopify:inspector:activate",
        "shopify:inspector:deactivate",
        "shopify:section:load",
        "shopify:block:deselect",
        "shopify:section:reorder",
        "shopify:section:select",
        "shopify:section:deselect",
        "shopify:inspector:activate",
        "shopify:inspector:deactivate",
      ];

      customizationEvents.forEach((event) => {
        document.addEventListener(event, () => swiper.init(swiperOptions));
      });
    }
  });
};

window.addEventListener("DOMContentLoaded", () => {
  theme.announcementBar();
});
