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

  const orderSummary = entries.map(([id, quantity]) => {
    const product = PRODUCTS[id];
    return `${product.name} × ${quantity}`;
  }).join('\n');

  const customerName = prompt('Enter your name:');
  if (!customerName) return;

  const email = prompt('Enter your email:');
  if (!email) return;

  const address = prompt('Enter your delivery address:');
  if (!address) return;

  const paymentMethod = prompt(
    'Choose a payment method:\n\n' +
    '1 - UPI\n' +
    '2 - Card\n' +
    '3 - Cash on Delivery\n\n' +
    'Enter 1, 2 or 3:'
  );

  if (!['1', '2', '3'].includes(paymentMethod)) {
    alert('Please choose a valid payment method.');
    return;
  }

  const methodNames = {
    '1': 'UPI',
    '2': 'Card',
    '3': 'Cash on Delivery'
  };

  const orderNumber = 'ELA' + Date.now().toString().slice(-6);

  alert(
    'ORDER CONFIRMED!\n\n' +
    'Order: ' + orderNumber + '\n' +
    'Customer: ' + customerName + '\n\n' +
    orderSummary + '\n\n' +
    'Total: ₹' + total.toLocaleString('en-IN') + '\n' +
    'Payment: ' + methodNames[paymentMethod] + '\n\n' +
    'Thank you for choosing ELAROSÈ.'
  );

  Object.keys(cart).forEach(key => delete cart[key]);

  renderCart('Order confirmed — thank you for choosing ELAROSÈ!');
}

renderCart();
