const PRODUCTS = {
  ring: { id: 'ring', name: 'Smart Ring', price: 5499 },
  pendant: { id: 'pendant', name: 'Smart Pendant', price: 3999 },
  bracelet: { id: 'bracelet', name: 'Smart Bracelet', price: 4499 }
};

const cart = {};

function addToCart(productId) {
  if (!PRODUCTS[productId]) return;
  cart[productId] = (cart[productId] || 0) + 1;
  renderCart(`${PRODUCTS[productId].name} added to your cart.`);
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
}

function removeFromCart(productId) {
  delete cart[productId];
  renderCart();
}

function changeQuantity(productId, delta) {
  if (!cart[productId]) return;
  cart[productId] += delta;
  if (cart[productId] <= 0) delete cart[productId];
  renderCart();
}

function renderCart(message) {
  const itemsEl = document.getElementById('cart-items');
  const messageEl = document.getElementById('cart-message');
  const totalEl = document.getElementById('cart-total');
  const entries = Object.entries(cart);

  if (!entries.length) {
    messageEl.textContent = message || 'Your cart is empty.';
    itemsEl.innerHTML = '';
    totalEl.textContent = '';
    return;
  }

  messageEl.textContent = message || 'Review your items before payment.';
  let total = 0;
  itemsEl.innerHTML = entries.map(([id, quantity]) => {
    const product = PRODUCTS[id];
    const lineTotal = product.price * quantity;
    total += lineTotal;
    return `<div class="cart-row"><div><strong>${product.name}</strong><small>₹${product.price.toLocaleString('en-IN')} each</small></div><div class="qty"><button onclick="changeQuantity('${id}', -1)">−</button><span>${quantity}</span><button onclick="changeQuantity('${id}', 1)">+</button></div><strong>₹${lineTotal.toLocaleString('en-IN')}</strong><button class="remove" onclick="removeFromCart('${id}')">Remove</button></div>`;
  }).join('');
  totalEl.textContent = `Cart total: ₹${total.toLocaleString('en-IN')}`;
}

async function checkout() {
  if (!Object.keys(cart).length) {
    alert('Your cart is empty. Add a product first.');
    return;
  }

  const button = document.querySelector('#shop .primary');
  button.disabled = true;
  button.textContent = 'Creating order…';

  try {
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not create the order.');

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'ELAROSÈ',
      description: 'Elarosè wearable safety product',
      order_id: data.orderId,
      handler: async function (payment) {
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment)
        });
        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok || !verifyData.verified) {
          alert('Payment was received but verification could not be completed. Please contact the store administrator with your payment ID.');
          return;
        }
        alert(`Payment successful!\nPayment ID: ${payment.razorpay_payment_id}`);
        Object.keys(cart).forEach(key => delete cart[key]);
        renderCart('Thank you — your payment was verified.');
      },
      prefill: {},
      theme: { color: '#9e5f5d' },
      modal: {
        ondismiss: function () {
          button.disabled = false;
          button.textContent = 'Proceed to secure payment';
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      alert(`Payment failed.\n${response.error && response.error.description ? response.error.description : 'Please try again.'}`);
    });
    rzp.open();
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Proceed to secure payment';
  }
}

renderCart();
