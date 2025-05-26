document.addEventListener("DOMContentLoaded", function () {
  const selectors = {
    customerAddresses: "[data-customer-addresses]",
    addressCountrySelect: "[data-address-country-select]",
    addressContainer: "[data-address]",
    toggleAddressButton: "button[aria-expanded]",
    cancelAddressButton: 'button[type="reset"]',
    deleteAddressButton: "button[data-confirm-message]",
    closeAddressPopup: ".popup-close",
    deletePopup: "#deleteAddressPopup",
    confirmDelete: "#confirmDelete",
    cancelDelete: "#cancelDelete",
  };

  const attributes = {
    expanded: "aria-expanded",
    confirmMessage: "data-confirm-message",
  };

  class CustomerAddresses {
    constructor() {
      this.elements = this._getElements();
      if (Object.keys(this.elements).length === 0) return;
      this._setupCountries();
      this._setupEventListeners();
    }

    _getElements() {
      const container = document.querySelector(selectors.customerAddresses);
      return container
        ? {
            container,
            addressContainer: container.querySelector(
              selectors.addressContainer
            ),
            toggleButtons: document.querySelectorAll(
              selectors.toggleAddressButton
            ),
            cancelButtons: container.querySelectorAll(
              selectors.cancelAddressButton
            ),
            deleteButtons: container.querySelectorAll(
              selectors.deleteAddressButton
            ),
            countrySelects: container.querySelectorAll(
              selectors.addressCountrySelect
            ),
            closeButtons: container.querySelectorAll(
              selectors.closeAddressPopup
            ),
            deletePopup: document.querySelector(selectors.deletePopup),
            confirmDelete: document.querySelector(selectors.confirmDelete),
            cancelDelete: document.querySelector(selectors.cancelDelete),
          }
        : {};
    }

    _setupCountries() {
      if (Shopify && Shopify.CountryProvinceSelector) {
        new Shopify.CountryProvinceSelector(
          "AddressCountryNew",
          "AddressProvinceNew",
          {
            hideElement: "AddressProvinceContainerNew",
          }
        );
        this.elements.countrySelects.forEach((select) => {
          const formId = select.dataset.formId;
          new Shopify.CountryProvinceSelector(
            `AddressCountry_${formId}`,
            `AddressProvince_${formId}`,
            {
              hideElement: `AddressProvinceContainer_${formId}`,
            }
          );
        });
      }
    }

    _setupEventListeners() {
      this.elements.toggleButtons.forEach((element) => {
        element.addEventListener("click", this._handleAddEditButtonClick);
      });
      this.elements.cancelButtons.forEach((element) => {
        element.addEventListener("click", this._handleCancelButtonClick);
      });
      this.elements.deleteButtons.forEach((element) => {
        element.addEventListener("click", this._handleDeleteButtonClick);
      });
      this.elements.closeButtons.forEach((element) => {
        element.addEventListener("click", this._handleCloseButtonClick);
      });
      this.elements.cancelDelete.addEventListener(
        "click",
        this._handleCancelDelete
      );
      this.elements.confirmDelete.addEventListener(
        "click",
        this._handleConfirmDelete
      );
    }

    _toggleExpanded(target) {
      target.setAttribute(
        attributes.expanded,
        (target.getAttribute(attributes.expanded) === "false").toString()
      );
    }

    _handleAddEditButtonClick = ({ currentTarget }) => {
      this._toggleExpanded(currentTarget);
    };

    _handleCancelButtonClick = ({ currentTarget }) => {
      this._toggleExpanded(
        currentTarget
          .closest(selectors.addressContainer)
          .querySelector(`[${attributes.expanded}]`)
      );
    };

    _handleDeleteButtonClick = ({ currentTarget }) => {
      this.currentDeleteTarget = currentTarget.dataset.target;
      this.elements.deletePopup.style.display = "flex";
    };

    _handleCancelDelete = () => {
      this.elements.deletePopup.style.display = "none";
    };

    _handleConfirmDelete = () => {
      if (this.currentDeleteTarget) {
        Shopify.postLink(this.currentDeleteTarget, {
          parameters: { _method: "delete" },
        });
      }
      this.elements.deletePopup.style.display = "none";
    };

    _handleCloseButtonClick = ({ currentTarget }) => {
      const popup = currentTarget.closest(selectors.addressContainer);
      if (popup) {
        const expandedElement = popup.querySelector(
          `[${attributes.expanded} = "true"]`
        );
        if (expandedElement) {
          this._toggleExpanded(expandedElement);
        }
      }
    };
  }

  new CustomerAddresses();
});
