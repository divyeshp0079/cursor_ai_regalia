if (!customElements.get("facet-filters")) {
  class facets extends HTMLElement {
    constructor() {
      super();
      this.filterOnChange();
      this.shortBy();
    }

    // fatch filter

    renderFilter = ($url) => {
      let pageLoader = document.querySelector(".page-loader");
      pageLoader.style.display = null;
      fetch($url)
        .then((res) => res.text())
        .then((body) => {
          var resHtml = new DOMParser().parseFromString(body, "text/html");

          let productGrid = resHtml.querySelector(
            "#ProductCardContainer .collection-grid"
          );
          let filterEles = resHtml.querySelector(
            "#FacetFiltersForm facet-filters"
          );
          let filterApplied = resHtml.querySelector(
            "#ProductCardContainer .filter-group.filter-group--applied"
          );

          if (productGrid) {
            productGrid = productGrid.outerHTML;
          }
          if (filterEles) {
            filterEles = filterEles.outerHTML;
          }
          if (filterApplied) {
            filterApplied = filterApplied.outerHTML;
          }

          let count = resHtml.querySelector("#filterTrigger")?.innerHTML;
          if (count) {
            document.querySelector("#filterTrigger").innerHTML = count;
          }

          setTimeout(() => {
            pageLoader.style.display = "none";
          }, 500);

          if (productGrid) {
            document.querySelector(
              "#ProductCardContainer .collection-grid"
            ).outerHTML = productGrid;
            updateProductCount();
          }
          if (filterEles) {
            document.querySelector(
              "#FacetFiltersForm facet-filters"
            ).outerHTML = filterEles;
          }

          let loader = document.querySelector(".pagination-loader");
          if (
            resHtml.querySelector("#ProductCardContainer .collection-grid")
              .dataset?.nextPage != ""
          ) {
            loader.style.display = null;
          } else {
            loader.style.display = "none";
          }

          if (filterApplied) {
            let activeFilter = document.querySelector(
              "#ProductCardContainer .filter-group.filter-group--applied"
            );
            if (!activeFilter) {
              let gridElement = document.querySelector(
                "#ProductCardContainer .collection-grid"
              );
              gridElement.insertAdjacentHTML("beforebegin", filterApplied);
              updateProductCount();
            } else {
              activeFilter.outerHTML = filterApplied;
              updateProductCount();
            }
          } else {
            let filterApplied = document.querySelector(
              "#ProductCardContainer .filter-group.filter-group--applied"
            );
            if (filterApplied) {
              filterApplied.remove();
              updateProductCount();
            }
          }

          // animation function
          theme.onScrollAnimation();
        })
        .catch((err) => console.log("error:", err));

      function updateProductCount() {
        let visibleProducts = document.querySelectorAll(
          "#ProductCardContainer .collection-grid .product-item"
        ).length;
        let productCountElement = document.querySelector(".product-count");

        if (productCountElement) {
          productCountElement.innerText = `Showing ${visibleProducts} products`;
        }
      }
    };

    // on change
    filterOnChange = () => {
      let formELe = this.querySelector("form");
      let filterEles = this.querySelectorAll("input");
      filterEles.forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          let inputStatus = e.currentTarget.checked;
          let urlParams = window.location.search;
          if (
            inputStatus ||
            (e.currentTarget.type == "number" && e.currentTarget.value != "")
          ) {
            let value = e.currentTarget.value;
            if (
              parseInt(e.currentTarget.value) > parseInt(e.currentTarget.max) &&
              e.currentTarget.type == "number"
            ) {
              value = e.currentTarget.max;
            } else if (e.currentTarget.value < 0) {
              value = e.currentTarget.min;
            }
            let url;
            if (urlParams != "") {
              if (
                urlParams.indexOf(e.currentTarget.name) > 0 &&
                e.currentTarget.type == "number"
              ) {
                let params = new URLSearchParams(window.location.search);
                params.delete(e.currentTarget.name);
                let finalParams = params.toString();
                finalParams != ""
                  ? (url = `${window.location.pathname}?${finalParams}&${e.currentTarget.name}=${value}`)
                  : (url = `${window.location.pathname}?${e.currentTarget.name}=${value}`);
              } else {
                url = `${window.location.href}&${e.currentTarget.name}=${value}`;
              }
            } else if (window.location.href.indexOf("?") > -1) {
              url = `${window.location.href}${e.currentTarget.name}=${value}`;
            } else {
              url = `${window.location.href}?${e.currentTarget.name}=${value}`;
            }
            this.renderFilter(url);
            this.updateURLHash(url);
          } else {
            let finalParams = "?";
            let currParam = `${e.currentTarget.name}=${e.currentTarget.value}`;
            let paramsArray = urlParams?.replace("?", "").split("&");
            for (let i = 0; i < paramsArray.length; i++) {
              if (e.currentTarget.type == "number") {
                if (paramsArray[i].split("=")[0] != currParam.split("=")[0]) {
                  finalParams = `${finalParams}&${paramsArray[i]}`;
                }
              } else {
                if (paramsArray[i] != currParam) {
                  finalParams = `${finalParams}&${paramsArray[i]}`;
                }
              }
            }
            finalParams = finalParams.replace("?&", "?");
            this.renderFilter(finalParams);
            this.updateURLHash(finalParams);
          }
        });
      });
    };

    // collection sorting

    shortBy = () => {
      document.querySelectorAll(".sortby-value").forEach((sortby) => {
        sortby.addEventListener("click", (e) => {
          e.preventDefault();

          // let selectedSort = e.currentTarget.value;
          let selectedSortText = e.currentTarget.innerText;
          let urlParams = new URLSearchParams(window.location.search);
          console.log("url", urlParams);
          urlParams.set(e.currentTarget.name, e.currentTarget.value);

          let sortByParam = urlParams.get("sort_by");
          if (sortByParam) {
            urlParams.set("sort_by", sortByParam);
          }

          let updatedUrl = `${
            window.location.pathname
          }?${urlParams.toString()}`;
          document.querySelector(".sortby-page").innerText = selectedSortText;
          this.renderFilter(updatedUrl);
          this.updateURLHash(updatedUrl);

          document
            .querySelectorAll(".sortby-value")
            .forEach((btn) => btn.classList.remove("activeOption"));
          e.currentTarget.classList.add("activeOption");

          // Close dropdown after selection
          setTimeout(() => {
            const sortTopheader = document.querySelector(".sortbycontent");
            if (sortTopheader) {
              sortTopheader.classList.remove("dropdown");
            }
          }, 700);
        });
      });
    };

    //update URL
    updateURLHash(url) {
      history.replaceState({ url }, "", `${url}`);
    }
  }

  customElements.define("facet-filters", facets);
}

document.addEventListener("DOMContentLoaded", function () {
  const sortByHeader = document.querySelector(".sortby-header");
  if (sortByHeader) {
  sortByHeader.addEventListener("click", function () {
    const sortOption = document.querySelector(".sortbycontent");
    sortOption.classList.toggle("dropdown");
  });
  sortByHeader.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const sortOption = document.querySelector(".sortbycontent");
      sortOption.classList.toggle("dropdown");
    }
  });
  }  

  document.querySelectorAll(".sortby-value").forEach((sortby) => {
    sortby.addEventListener("click", function () {
      document
        .querySelectorAll(".sortby-value")
        .forEach((btn) => btn.classList.remove("activeOption"));
      this.classList.add("activeOption");

      setTimeout(() => {
        const sortTopheader = document.querySelector(".sortbycontent");
        if (sortTopheader) {
          sortTopheader.classList.remove("dropdown");
        }
      }, 700);
    });
  });

  document.addEventListener("click", function (event) {
    const sortTopheader = document.querySelector(".sortbycontent");
    if (
      sortTopheader &&
      !sortTopheader.contains(event.target) &&
      !event.target.closest(".sortby-header")
    ) {
      sortTopheader.classList.remove("dropdown");
    }
  });
});
