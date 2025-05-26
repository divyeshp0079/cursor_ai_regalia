document.addEventListener("DOMContentLoaded", function () {
  var container = [];

  // Select all figure elements inside #gallery and loop over them
  document.querySelectorAll("#gallery figure").forEach(function (figure) {
    var link = figure.querySelector("a");

    if (link) {
      var item = {
        src: link.getAttribute("href"),
        w: parseInt(link.getAttribute("data-width"), 10) || 0,
        h: parseInt(link.getAttribute("data-height"), 10) || 0,
        title: link.getAttribute("data-caption") || "",
      };
      container.push(item);
    }
  });

  // Function to open PhotoSwipe
  function openPhotoSwipe(index) {
    var pswpElement = document.querySelector(".pswp");

    if (!pswpElement) {
      console.error("PhotoSwipe container not found.");
      return;
    }

    var options = {
      captionEl: false,
      index: index,
      closeOnOutsideClick: true,
      shareEl: false,
      bgOpacity: 1,
      closeOnScroll: false,
      preloaderEl: true,
      zoomEl: false,
      fullscreenEl: false,
      showHideOpacity: true,
      clickToCloseNonZoomable: false,
      allowPanToNext: false,
      getDoubleTapZoom: function (isMouseClick, item) {
        return item.w > 200 ? 1.5 : 1.5;
      },
      maxSpreadZoom: 1.5,
    };

    var gallery = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      container,
      options
    );

    gallery.init();
  }

  // Click event for the main gallery images
  document.querySelector("#gallery").addEventListener("click", function (event) {
      var target = event.target.closest("a");

      if (!target || !target.closest("figure")) {
        return;
      }

      event.preventDefault();

      var index = Array.from(
        document.querySelectorAll("#gallery figure")
      ).indexOf(target.closest("figure"));

      if (index < 0 || index >= container.length) {
        console.error("Invalid index for PhotoSwipe.");
        return;
      }

      openPhotoSwipe(index);
    });

  // Click event for the zoom icon inside img-overlay-icon
  document
    .querySelector(".img-overlay-icon .product-zoom-icon")
    .addEventListener("click", function () {
      openPhotoSwipe(0); // Open the first image in the gallery
    });
});
