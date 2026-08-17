(() => {
  const CART_KEY = 'executive-presence-mockup-cart';

  const announce = (message, context = document.body) => {
    let status = context.querySelector?.('[data-mockup-status]');
    if (!status) {
      status = document.createElement('p');
      status.dataset.mockupStatus = 'true';
      status.setAttribute('role', 'status');
      status.style.cssText = 'margin:16px 0;padding:12px 16px;border-left:4px solid #e9b422;background:#f7f5ef;color:#202020;font:600 14px/1.4 Arial,sans-serif';
      context.append(status);
    }
    status.textContent = message;
  };

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form');
    if (!form) return;
    event.preventDefault();

    const isCommerce = form.matches('[data-form-id*="commerce"], .product-form') || form.querySelector('[data-test="add-to-cart"]');
    if (isCommerce) {
      const quantity = Number(form.querySelector('[name="quantity"]')?.value || 1);
      const current = Number(localStorage.getItem(CART_KEY) || 0);
      localStorage.setItem(CART_KEY, String(current + Math.max(1, quantity)));
      announce('Added to the local review cart. No purchase or payment was submitted.', form);
      refreshCartCounts();
      return;
    }

    const fields = [...form.querySelectorAll('input, textarea, select')].filter((field) => !['hidden', 'submit', 'button'].includes(field.type));
    const newsletter = fields.length <= 2 && fields.some((field) => field.type === 'email');
    if (newsletter) {
      form.reset();
      announce('Signup interaction completed locally. No email address was transmitted.', form);
    } else {
      window.location.href = 'inventory-inquiry-form-success-6.html';
    }
  }, true);

  const refreshCartCounts = () => {
    const count = Number(localStorage.getItem(CART_KEY) || 0);
    document.querySelectorAll('.cart-quantity, [data-test="cart-quantity"]').forEach((node) => { node.textContent = String(count); });
    document.querySelectorAll('a[href="cart.html"]').forEach((node) => node.setAttribute('aria-label', `${count} items in local review cart`));
  };

  refreshCartCounts();

  if (!document.querySelector('.floating-snapshot')) {
    const snapshotLink = document.createElement('a');
    snapshotLink.className = 'floating-snapshot';
    snapshotLink.href = 'snapshot.html';
    snapshotLink.textContent = 'Take the Snapshot';
    snapshotLink.setAttribute('aria-label', 'Take the Executive Presence Snapshot');
    document.body.append(snapshotLink);

    const snapshotStyle = document.createElement('style');
    snapshotStyle.textContent = '.floating-snapshot{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:99999;background:#375d98;color:#fff!important;text-decoration:none;padding:22px 12px;writing-mode:vertical-rl;text-transform:uppercase;font:700 11px/1 "Open Sans",Arial,sans-serif;letter-spacing:.08em;box-shadow:0 8px 25px rgba(0,0,0,.2)}@media(max-width:800px){.floating-snapshot{top:auto;bottom:0;left:0;right:0;transform:none;writing-mode:horizontal-tb;text-align:center;padding:15px}}';
    document.head.append(snapshotStyle);
  }
})();
