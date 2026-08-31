// ==========================================
// FIREBASE CONFIGURATION - ඔයාගේ Config
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDduouixF2IW568mND20cfxmnBNxQfRkrg",
    authDomain: "foodhub-app-6632c.firebaseapp.com",
    databaseURL: "https://foodhub-app-6632c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "foodhub-app-6632c",
    storageBucket: "foodhub-app-6632c.firebasestorage.app",
    messagingSenderId: "1025149369233",
    appId: "1:1025149369233:web:245f846d959274ee487830"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Data Variables
let shops = [];
let foods = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedPaymentMethod = 'cod';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadShopsFromFirebase();
    loadFoodsFromFirebase();
    renderOrders();
    updateCartCount();
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm) {
            filterShops(searchTerm);
            filterFoods(searchTerm);
        } else {
            renderShops();
            renderFoods();
        }
    });
});

// Load Shops from Firebase (Real-time)
function loadShopsFromFirebase() {
    database.ref('shops').on('value', (snapshot) => {
        const data = snapshot.val();
        shops = data ? Object.values(data) : [];
        renderShops();
    });
}

// Load Foods from Firebase (Real-time)
function loadFoodsFromFirebase() {
    database.ref('foods').on('value', (snapshot) => {
        const data = snapshot.val();
        foods = data ? Object.values(data) : [];
        renderFoods();
    });
}

// Tab Switching
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

// Render Shops
function renderShops() {
    const shopsList = document.getElementById('shopsList');
    if (!shopsList) return;
    
    if (shops.length === 0) {
        shopsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"> Shops තවම නැහැ. Admin panel එකෙන් shops add කරන්න!</div>';
        return;
    }
    
    shopsList.innerHTML = shops.map(shop => `
        <div class="shop-card" onclick="viewShop('${shop.id}')">
            <img src="${shop.image}" class="shop-image" alt="${shop.name}" onerror="this.src='https://via.placeholder.com/500'">
            <div class="shop-info">
                <div class="shop-name">${shop.name}</div>
                <div class="shop-details">
                    <span>⏱️ ${shop.deliveryTime || '30-40 min'}</span>
                    <span class="rating">⭐ ${shop.rating || '4.0'}</span>
                </div>
                <div class="shop-details">
                    <span>🚚 Delivery: Rs. ${shop.deliveryFee || 150}</span>
                </div>
                <div class="shop-tags">
                    ${(shop.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Render Foods
function renderFoods() {
    const foodsList = document.getElementById('foodsList');
    if (!foodsList) return;
    
    if (foods.length === 0) {
        foodsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">🍕 Foods තවම නැහැ. Admin panel එකෙන් foods add කරන්න!</div>';
        return;
    }
    
    foodsList.innerHTML = foods.map(food => {
        const shop = shops.find(s => s.id === food.shopId);
        return `
            <div class="food-card">
                <img src="${food.image}" class="food-image" alt="${food.name}" onerror="this.src='https://via.placeholder.com/500'">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${shop ? shop.name : ''}</div>
                    <div class="food-price">Rs. ${food.price}</div>
                    <button class="btn btn-primary" onclick="addToCart('${food.id}')">🛒 Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

// View Shop
function viewShop(shopId) {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    
    const shopFoods = foods.filter(f => f.shopId === shopId);
    
    const shopHtml = `
        <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <img src="${shop.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
            <h2 style="margin-bottom: 10px;">${shop.name}</h2>
            <p style="color: #666; margin-bottom: 15px;">⭐ ${shop.rating || '4.0'} | ️ ${shop.deliveryTime || '30-40 min'} | 🚚 Rs. ${shop.deliveryFee || 150}</p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-whatsapp" onclick="orderWhatsApp('${shop.id}')">💬 WhatsApp Order</button>
                <button class="btn btn-call" onclick="orderCall()">📞 Call Order</button>
            </div>
            
            <h3 style="margin-bottom: 15px;">Menu</h3>
            <div class="food-grid">
                ${shopFoods.length > 0 ? shopFoods.map(food => `
                    <div class="food-card">
                        <img src="${food.image}" class="food-image" alt="${food.name}" onerror="this.src='https://via.placeholder.com/500'">
                        <div class="food-info">
                            <div class="food-name">${food.name}</div>
                            <div class="food-price">Rs. ${food.price}</div>
                            <button class="btn btn-primary" onclick="addToCart('${food.id}')"> Add</button>
                        </div>
                    </div>
                `).join('') : '<p style="color:#999; text-align:center; padding:20px;">මේ shop එකේ foods තවම නැහැ</p>'}
            </div>
            <button onclick="renderShops(); window.scrollTo(0,0);" class="btn" style="background:#eee; color:#333; margin-top:20px;">⬅️ Back to Shops</button>
        </div>
    `;
    
    document.getElementById('shopsList').innerHTML = shopHtml;
    window.scrollTo(0, 0);
}

// Add to Cart
function addToCart(foodId) {
    const food = foods.find(f => f.id === foodId);
    if (!food) return;
    
    const existingItem = cart.find(item => item.id === foodId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...food, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`✅ ${food.name} cart එකට එකතු වුණා!`);
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = count;
}

// Order via WhatsApp
function orderWhatsApp(shopId) {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    
    const cartItems = cart.map(item => `${item.name} x${item.quantity}`).join('%0A');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `*New Order from FoodHub*%0A%0A*Shop:* ${shop.name}%0A%0A*Items:*%0A${cartItems}%0A%0A*Total:* Rs. ${total}%0A%0A*Delivery Address:* [Your Address]`;
    
    window.open(`https://wa.me/94766488689?text=${message}`, '_blank');
}

// Order via Call
function orderCall() {
    window.location.href = `tel:+94766488689`;
}

// Checkout Functions
function openCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const modal = document.getElementById('checkoutModal');
    const itemsDiv = document.getElementById('checkoutItems');
    const totalDiv = document.getElementById('checkoutTotal');

    itemsDiv.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span>${item.name} x${item.quantity}</span>
            <span>Rs. ${item.price * item.quantity}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalDiv.textContent = `Rs. ${total}`;

    modal.style.display = 'block';
    selectPayment('cod');
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.style.display = 'none';
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    const btnCod = document.getElementById('btn-cod');
    const btnOnline = document.getElementById('btn-online');
    const onlineDetails = document.getElementById('onlinePaymentDetails');
    
    if (btnCod) btnCod.className = method === 'cod' ? 'pay-btn active' : 'pay-btn';
    if (btnOnline) btnOnline.className = method === 'online' ? 'pay-btn active' : 'pay-btn';
    if (onlineDetails) onlineDetails.style.display = method === 'online' ? 'block' : 'none';
}

function confirmOrder() {
    const address = document.getElementById('deliveryAddress').value.trim();
    if (!address) {
        alert('කරුණාකර Delivery Address එක ඇතුළත් කරන්න!');
        return;
    }

    if (selectedPaymentMethod === 'online') {
        const transId = document.getElementById('transactionId').value.trim();
        if (!transId) {
            alert('කරුණාකර Transaction ID (Ref No) එක ඇතුළත් කරන්න!');
            return;
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} x${item.quantity} (Rs. ${item.price * item.quantity})`).join('%0A');
    
    let paymentInfo = '';
    if (selectedPaymentMethod === 'cod') {
        paymentInfo = '*Payment:* 💵 Cash on Delivery';
    } else {
        const transId = document.getElementById('transactionId').value.trim();
        paymentInfo = `*Payment:* 🏦 Online Transfer%0A*Transaction ID:* ${transId}`;
    }

    // Save to Firebase
    const newOrder = {
        items: cart.map(i => i.name).join(', '),
        total: total,
        status: 'Pending',
        paymentMethod: selectedPaymentMethod,
        address: address,
        date: new Date().toISOString()
    };
    
    database.ref('orders').push(newOrder);

    // Save to local storage
    orders.push({ ...newOrder, id: Date.now() });
    localStorage.setItem('orders', JSON.stringify(orders));

    // WhatsApp message
    const message = `*🆕 New Order - FoodHub*%0A%0A*Items:*%0A${itemsList}%0A%0A*Total:* Rs. ${total}%0A%0A${paymentInfo}%0A%0A* Delivery Address:*%0A${address}`;
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    closeCheckout();

    // Open WhatsApp
    window.open(`https://wa.me/94766488689?text=${message}`, '_blank');
    
    alert('✅ Order Confirmed! WhatsApp එකට යවන ලදී.');
    renderOrders();
}

// Render Orders
function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    let html = '';

    if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        html += `
            <div style="background: #FFF0F0; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #FF6B6B;">
                <h3 style="margin-bottom: 10px;"> Your Cart (${cart.reduce((t,i)=>t+i.quantity,0)} items)</h3>
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
                <div style="font-weight: bold; margin-bottom: 10px;">Order #${order.id ? order.id.toString().slice(-6) : 'New'}</div>
                <div style="color: #666; font-size: 14px;">
                    <div>Items: ${order.items}</div>
                    <div>Total: Rs. ${order.total}</div>
                    <div>Payment: ${order.paymentMethod === 'cod' ? '💵 COD' : '🏦 Online'}</div>
                    <div>Status: ${order.status}</div>
                    <div>Date: ${new Date(order.date).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }
    ordersList.innerHTML = html;
}

// Filter Functions
function filterShops(term) {
    const filtered = shops.filter(shop => 
        (shop.name && shop.name.toLowerCase().includes(term)) ||
        (shop.tags && shop.tags.some(tag => tag.toLowerCase().includes(term)))
    );
    
    const shopsList = document.getElementById('shopsList');
    if (!shopsList) return;
    
    shopsList.innerHTML = filtered.map(shop => `
        <div class="shop-card" onclick="viewShop('${shop.id}')">
            <img src="${shop.image}" class="shop-image" alt="${shop.name}" onerror="this.src='https://via.placeholder.com/500'">
            <div class="shop-info">
                <div class="shop-name">${shop.name}</div>
                <div class="shop-details">
                    <span>⏱️ ${shop.deliveryTime || '30-40 min'}</span>
                    <span class="rating">⭐ ${shop.rating || '4.0'}</span>
                </div>
                <div class="shop-tags">
                    ${(shop.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function filterFoods(term) {
    const filtered = foods.filter(food => food.name && food.name.toLowerCase().includes(term));
    
    const foodsList = document.getElementById('foodsList');
    if (!foodsList) return;
    
    foodsList.innerHTML = filtered.map(food => {
        const shop = shops.find(s => s.id === food.shopId);
        return `
            <div class="food-card">
                <img src="${food.image}" class="food-image" alt="${food.name}" onerror="this.src='https://via.placeholder.com/500'">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${shop ? shop.name : ''}</div>
                    <div class="food-price">Rs. ${food.price}</div>
                    <button class="btn btn-primary" onclick="addToCart('${food.id}')">🛒 Add</button>
                </div>
            </div>
        `;
    }).join('');
}
