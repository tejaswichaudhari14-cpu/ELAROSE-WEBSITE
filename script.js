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
  const entries = Object.entries(cart);

  if (!entries.length) {
    alert('Your cart is empty. Add a product first.');
    return;
  }

  let total = 0;

  entries.forEach(([id, quantity]) => {
    total += PRODUCTS[id].price * quantity;
  });

  const checkoutItems = entries.map(([id, quantity]) => ({
    ...PRODUCTS[id],
    quantity
  }));

  openCheckout(checkoutItems, total);
}

function openCheckout(items, total) {
  const overlay = document.getElementById('checkout-overlay');
  const itemsContainer = document.getElementById('checkout-items');
  const totalElement = document.getElementById('checkout-total');

  itemsContainer.innerHTML = items.map(item => `
    <div class="checkout-product">
      <div>
        <strong>${item.name}</strong>
        <small>Quantity: ${item.quantity}</small>
      </div>
      <strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
    </div>
  `).join('');

  totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;

  overlay.classList.add('active');
  document.body.classList.add('checkout-open');
}

function closeCheckout() {
  document.getElementById('checkout-overlay').classList.remove('active');
  document.body.classList.remove('checkout-open');
}

function submitDemoOrder(event) {
  event.preventDefault();

  const name = document.getElementById('checkout-name').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const payment = document.querySelector('input[name="payment"]:checked');

  if (!name || !email || !address || !payment) {
    alert('Please complete all checkout details.');
    return;
  }

  const orderNumber = 'ELA' + Date.now().toString().slice(-6);

  document.getElementById('checkout-form').style.display = 'none';
  document.getElementById('checkout-success').style.display = 'block';

  document.getElementById('order-number').textContent = orderNumber;

  Object.keys(cart).forEach(key => delete cart[key]);
  renderCart('Order confirmed — thank you for choosing ELAROSÈ!');
}

renderCart();
