document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.faq-item-wrapper').forEach((faqItem) => {
    faqItem.querySelector('.faq-question').addEventListener('click', () => {
      document.querySelectorAll('.faq-item-wrapper').forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove('open');
        }
      });
      faqItem.classList.toggle('open');
    });
  });
});

