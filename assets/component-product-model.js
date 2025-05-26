class ProductModel extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.loadContent();
  }
  loadContent() {
    Shopify.loadFeatures([
      {
        name: "model-viewer-ui",
        version: "1.0",
        onLoad: this.setupModelViewerUI.bind(this),
      },
    ]);
  }
  setupModelViewerUI(errors) {
    if (errors) return;
    const modelViewer = this.querySelector("model-viewer");
    modelViewer &&
      (this.modelViewerUI = new Shopify.ModelViewerUI(modelViewer));
  }
}
customElements.define("product-model", ProductModel);
