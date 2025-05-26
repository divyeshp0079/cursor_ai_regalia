theme.videoCarousel = () => {
  let videoCarouselEl = document.querySelectorAll(
    ".video-carousel-wrapper.swiper"
  );
  videoCarouselEl.forEach((current) => {
    let swiperOptions = JSON.parse(current.dataset.sliderOptions);
    swiper = new Swiper(current, swiperOptions);

    current.addEventListener("mouseover", () => {
      swiper.autoplay.stop();
    });
    current.addEventListener("mouseleave", () => {
      swiper.autoplay.start();
    });

    let videos = current.querySelectorAll(".video-carousel__video");
    videos.forEach((video) => {
      video.addEventListener("loadedmetadata", () => {
        setTimeout(() => swiper.update(), 500);
      });
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
        setTimeout(() => {
          swiper.update();
        }, 500);
      });
    }
    setTimeout(() => swiper.update(), 500);
  });
};

window.addEventListener("DOMContentLoaded", () => {
  theme.videoCarousel();
});
