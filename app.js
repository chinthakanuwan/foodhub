// Data Storage
let shops = JSON.parse(localStorage.getItem('shops')) || [];
let foods = JSON.parse(localStorage.getItem('foods')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sample Data
if (shops.length === 0) {
    shops = [
        { id: 1, name: "Pizza Hut", image: "https://images.unsplash.com/photo-1513104890138-7c749659a59f?w=500", rating: 4.5, deliveryTime: "30-40 min", deliveryFee: 150, phone: "0766488689", tags: ["Pizza", "Italian", "Fast Food"] },
        { id: 2, name: "KFC", image: "https://images.unsplash.com/photo-1513639776629-7b611594e29b?w=500", rating: 4.3, deliveryTime: "25-35 min", deliveryFee: 120, phone: "0766488689", tags: ["Chicken", "Fast Food"] }
    ];
    localStorage.setItem('shops', JSON.stringify(shops));
}

if (foods.length === 0) {
    foods = [
        { id: 1, shopId: 1, name: "Margherita Pizza", price: 1200, image: "https://images.unsplash.com/photo-1604068549810-657bd9cecfbb?w=500", description: "Cheese pizza with tomato sauce" },
        { id: 2, shopId: 1, name: "Pepperoni Pizza", price: 1500, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500", description: "Pizza with pepperoni and cheese" },
        { id: 3, shopId: 2, name: "Fried Chicken", price: 850, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500", description: "Crispy fried chicken" }
    ];
    localStorage.setItem('foods', JSON.stringify(foods));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderShops();
    renderFoods();
    renderOrders();
    updateCartCount();
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm) { filterShops(searchTerm); filterFoods(searchTerm); } 
        else { renderShops(); renderFoods(); }
    });
});

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('shopsTab').classList.add('hidden');
    document.getElementById('foodsTab').classList.add('hidden');
    document.getElementById('ordersTab').classList.add('hidden');
    
    if (tab === 'shops') {
        document.getElementById('shopsTab').classList.remove('hidden');
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (tab === 'foods') {
        document.getElementById('foodsTab').classList.remove('hidden');
        document.querySelectorAll('.tab')[1].classList.add('active');
        document.querySelectorAll('.nav-item')[1].classList.add('active');
    } else if (tab === 'orders') {
        document.getElementById('ordersTab').classList.remove('hidden');
        document.querySelectorAll('.tab')[2].classList.add('active');
        document.querySelectorAll('.nav-item')[2].classList.add('active');
        renderOrders();
    }
}

function renderShops() {
    const shopsList = document.getElementById('shopsList');
    shopsList.innerHTML = shops.map(shop => `
        <div class="shop-card" onclick="viewShop(${shop.id})">
            <img src="${shop.image}" class="shop-image" alt="${shop.name}">
            <div class="shop-info">
                <div class="shop-name">${shop.name}</div>
                <div class="shop-details">
                    <span>️ ${shop.deliveryTime}</span>
                    <span class="rating">⭐ ${shop.rating}</span>
                </div>
                <div class="shop-details"><span>🚚 Delivery: Rs. ${shop.deliveryFee}</span></div>
                <div class="shop-tags">${shop.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
        </div>
    `).join('');
}

function renderFoods() {
    const foodsList = document.getElementById('foodsList');
    foodsList.innerHTML = foods.map(food => {
        const shop = shops.find(s => s.id === food.shopId);
        return `
            <div class="food-card">
                <img src="${food.image}" class="food-image" alt="${food.name}">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${shop ? shop.name : ''}</div>
                    <div class="food-price">Rs. ${food.price}</div>
                    <button class="btn btn-primary" onclick="addToCart(${food.id})"> Add</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewShop(shopId) {
    const shop = shops.find(s => s.id === shopId);
    const shopFoods = foods.filter(f => f.shopId === shopId);
    const shopHtml = `
        <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <img src="${shop.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
            <h2 style="margin-bottom: 10px;">${shop.name}</h2>
            <p style="color: #666; margin-bottom: 15px;">⭐ ${shop.rating} | ⏱️ ${shop.deliveryTime} | 🚚 Rs. ${shop.deliveryFee}</p>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-whatsapp" onclick="orderWhatsApp(${shop.id})">💬 WhatsApp</button>
                <button class="btn btn-call" onclick="orderCall(${shop.id})">📞 Call</button>
            </div>
            <h3 style="margin-bottom: 15px;">Menu</h3>
            <div class="food-grid">
                ${shopFoods.map(food => `
                    <div class="food-card">
                        <img src="${food.image}" class="food-image" alt="${food.name}">
                        <div class="food-info">
                            <div class="food-name">${food.name}</div>
                            <div class="food-price">Rs. ${food.price}</div>
                            <button class="btn btn-primary" onclick="addToCart(${food.id})">🛒 Add</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="renderShops(); window.scrollTo(0,0);" class="btn" style="background:#eee; color:#333; margin-top:20px;">⬅️ Back to Shops</button>
        </div>
    `;
    document.getElementById('shopsList').innerHTML = shopHtml;
    window.scrollTo(0, 0);
}

function addToCart(foodId) {
    const food = foods.find(f => f.id === foodId);
    const existingItem = cart.find(item => item.id === foodId);
    if (existingItem) { existingItem.quantity++; } 
    else { cart.push({ ...food, quantity: 1 }); }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${food.name} added to cart!`);
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function orderWhatsApp(shopId) {
    const shop = shops.find(s => s.id === shopId);
    const cartItems = cart.map(item => `${item.name} x${item.quantity}`).join('%0A');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `*New Order from FoodHub*%0A%0A*Shop:* ${shop.name}%0A%0A*Items:*%0A${cartItems}%0A%0A*Total:* Rs. ${total}%0A%0A*Delivery Address:* [Your Address]`;
    window.open(`https://wa.me/94766488689?text=${message}`, '_blank');
}

function orderCall(shopId) {
    window.location.href = `tel:+94766488689`;
}

// --- CHECKOUT & PAYMENT FUNCTIONS ---
let selectedPaymentMethod = 'cod';

function openCheckout() {
    if (cart.length === 0) { alert('Your cart is empty!'); return; }
    document.getElementById('checkoutModal').style.display = 'block';
    
    const itemsDiv = document.getElementById('checkoutItems');
    itemsDiv.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span>${item.name} x${item.quantity}</span>
            <span>Rs. ${item.price * item.quantity}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutTotal').textContent = `Rs. ${total}`;
    selectPayment('cod');
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    document.getElementById('btn-cod').className = method === 'cod' ? 'pay-btn active' : 'pay-btn';
    document.getElementById('btn-online').className = method === 'online' ? 'pay-btn active' : 'pay-btn';
    document.getElementById('onlinePaymentDetails').style.display = method === 'online' ? 'block' : 'none';
}

function confirmOrder() {
    const address = document.getElementById('deliveryAddress').value.trim();
    if (!address) { alert('කරුණාකර Delivery Address එක ඇතුළත් කරන්න!'); return; }

    if (selectedPaymentMethod === 'online') {
        const transId = document.getElementById('transactionId').value.trim();
        if (!transId) { alert('කරුණාකර Transaction ID (Ref No) එක ඇතුළත් කරන්න!'); return; }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} x${item.quantity} (Rs. ${item.price * item.quantity})`).join('%0A');
    
    let paymentInfo = '';
    if (selectedPaymentMethod === 'cod') { paymentInfo = '*Payment:* 💵 Cash on Delivery'; } 
    else { 
        const transId = document.getElementById('transactionId').value.trim();
        paymentInfo = `*Payment:* 🏦 Online Transfer%0A*Transaction ID:* ${transId}`; 
    }

    const newOrder = { id: Date.now(), items: cart.map(i => i.name).join(', '), total: total, status: 'Pending', date: new Date().toISOString(), paymentMethod: selectedPaymentMethod };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    const message = `* New Order - FoodHub*%0A%0A*Items:*%0A${itemsList}%0A%0A*Total:* Rs. ${total}%0A%0A${paymentInfo}%0A%0A*📍 Delivery Address:*%0A${address}`;
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    closeCheckout();

    window.open(`https://wa.me/94766488689?text=${message}`, '_blank');
    alert('Order Confirmed! WhatsApp එකට යවන ලදී.');
    renderOrders();
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    let html = '';

    if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        html += `
            <div style="background: #FFF0F0; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #FF6B6B;">
                <h3 style="margin-bottom: 10px;">🛒 Your Cart (${cart.reduce((t,i)=>t+i.quantity,0)} items)</h3>
                ${cart.map(item => `<div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:14px;"><span>${item.name} x${item.quantity}</span><span>Rs. ${item.price * item.quantity}</span></div>`).join('')}
                <div style="font-weight:bold; font-size:18px; margin: 15px 0; border-top: 1px dashed #ccc; padding-top: 10px; display:flex; justify-content:space-between;">
                    <span>Total:</span><span style="color:#FF6B6B;">Rs. ${total}</span>
                </div>
                <button class="btn btn-primary" onclick="openCheckout()" style="background: #FF6B6B; color: white; width: 100%; padding: 15px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Proceed to Checkout 🛒</button>
            </div>
        `;
    }

    if (orders.length === 0 && cart.length === 0) {
        html += '<p style="text-align: center; color: #999; padding: 40px;">No orders yet</p>';
    } else {
        html += orders.map(order => `
            <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-weight: bold; margin-bottom: 10px;">Order #${order.id.toString().slice(-6)}</div>
                <div style="color: #666; font-size: 14px;">
                    <div>Items: ${order.items}</div>
                    <div>Total: Rs. ${order.total}</div>
                    <div>Payment: ${order.paymentMethod === 'cod' ? '💵 COD' : ' Online'}</div>
                    <div>Status: ${order.status}</div>
                    <div>Date: ${new Date(order.date).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }
    ordersList.innerHTML = html;
}

function filterShops(term) {
    const filtered = shops.filter(shop => shop.name.toLowerCase().includes(term) || shop.tags.some(tag => tag.toLowerCase().includes(term)));
    document.getElementById('shopsList').innerHTML = filtered.map(shop => `
        <div class="shop-card" onclick="viewShop(${shop.id})">
            <img src="${shop.image}" class="shop-image" alt="${shop.name}">
            <div class="shop-info">
                <div class="shop-name">${shop.name}</div>
                <div class="shop-details"><span>⏱️ ${shop.deliveryTime}</span><span class="rating">⭐ ${shop.rating}</span></div>
                <div class="shop-tags">${shop.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
        </div>
    `).join('');
}

function filterFoods(term) {
    const filtered = foods.filter(food => food.name.toLowerCase().includes(term));
    document.getElementById('foodsList').innerHTML = filtered.map(food => {
        const shop = shops.find(s => s.id === food.shopId);
        return `
            <div class="food-card">
                <img src="${food.image}" class="food-image" alt="${food.name}">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${shop ? shop.name : ''}</div>
                    <div class="food-price">Rs. ${food.price}</div>
                    <button class="btn btn-primary" onclick="addToCart(${food.id})">🛒 Add</button>
                </div>
            </div>
        `;
    }).join('');
}