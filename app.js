// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDduouixF2IW568mND20cfxmnBNxQfRkrg",
    authDomain: "foodhub-app-6632c.firebaseapp.com",
    databaseURL: "https://foodhub-app-6632c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "foodhub-app-6632c",
    storageBucket: "foodhub-app-6632c.appspot.com",
    messagingSenderId: "1025149369233",
    appId: "1:1025149369233:web:245f846d959274ee487830"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let shops = [];
let foods = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedPaymentMethod = 'cod';
let currentFilter = null;

document.addEventListener('DOMContentLoaded', () => {
    loadShopsFromFirebase();
    loadFoodsFromFirebase();
    renderOrders();
    updateCartCount();
    
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

function loadShopsFromFirebase() {
    database.ref('shops').on('value', (snapshot) => {
        const data = snapshot.val();
        shops = data ? Object.keys(data).map(key => ({...data[key], id: key})) : [];
        renderShops();
    });
}

function loadFoodsFromFirebase() {
    database.ref('foods').on('value', (snapshot) => {
        const data = snapshot.val();
        foods = data ? Object.keys(data).map(key => ({...data[key], id: key})) : [];
        renderFoods();
    });
}

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
        renderFoods();
    } else if (tab === 'orders') {
        document.getElementById('ordersTab').classList.remove('hidden');
        document.querySelectorAll('.tab')[2].classList.add('active');
        document.querySelectorAll('.nav-item')[2].classList.add('active');
        renderOrders();
    }
}

function renderShops() {
    const shopsList = document.getElementById('shopsList');
    if (!shopsList) return;
    
    if (shops.length === 0) {
        shopsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">🏪 Shops තවම නැහැ</div>';
        return;
    }
    
    shopsList.innerHTML = shops.map(shop => `
        <div class="shop-card" onclick="viewShop('${shop.id}')">
            <img src="${shop.image}" class="shop-image" alt="${shop.name}" onerror="this.src='https://via.placeholder.com/500'">
            <div class="shop-info">
                <div class="shop-name">${shop.name} ${shop.isFeatured ? '⭐' : ''}</div>
                <div class="shop-details">
                    <span>⏱️ ${shop.deliveryTime || '30-40 min'}</span>
                    <span class="rating">⭐ ${shop.rating || '4.0'}</span>
                </div>
                <div class="shop-details"><span> Delivery: Rs. ${shop.deliveryFee || 150}</span></div>
                <div class="shop-tags">
                    ${(shop.tags || []).map(tag => `<span class="tag" onclick="event.stopPropagation(); filterByTag('${tag}')">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function filterByTag(tag) {
    currentFilter = tag;
    switchTab('foods');
    const filterDiv = document.getElementById('activeFilter');
    const filterText = document.getElementById('filterText');
    if (filterDiv && filterText) {
        filterDiv.style.display = 'block';
        filterText.textContent = `️ Showing: ${tag}`;
    }
    renderFoods();
}

function clearFilter() {
    currentFilter = null;
    const filterDiv = document.getElementById('activeFilter');
    if (filterDiv) filterDiv.style.display = 'none';
    renderFoods();
}

function renderFoods() {
    const foodsList = document.getElementById('foodsList');
    if (!foodsList) return;
    
    let displayFoods = foods;
    if (currentFilter) {
        displayFoods = foods.filter(food => {
            const shop = shops.find(s => s.id === food.shopId);
            return shop && shop.tags && shop.tags.some(tag => tag.toLowerCase() === currentFilter.toLowerCase());
        });
    }
    
    if (displayFoods.length === 0) {
        foodsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999; grid-column: 1/-1;"> Foods තවම නැහැ</div>';
        return;
    }
    
    foodsList.innerHTML = displayFoods.map(food => {
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

function viewShop(shopId) {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    
    const shopFoods = foods.filter(f => f.shopId === shopId);
    
    document.getElementById('shopsList').innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <img src="${shop.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
            <h2>${shop.name}</h2>
            <p style="color: #666; margin-bottom: 15px;">⭐ ${shop.rating} | ⏱️ ${shop.deliveryTime} |  Rs. ${shop.deliveryFee}</p>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-whatsapp" onclick="orderWhatsApp('${shop.id}')">💬 WhatsApp</button>
                <button class="btn btn-call" onclick="orderCall()"> Call</button>
            </div>
            <h3 style="margin-bottom: 15px;">Menu</h3>
            <div class="food-grid">
                ${shopFoods.map(food => `
                    <div class="food-card">
                        <img src="${food.image}" class="food-image">
                        <div class="food-info">
                            <div class="food-name">${food.name}</div>
                            <div class="food-price">Rs. ${food.price}</div>
                            <button class="btn btn-primary" onclick="addToCart('${food.id}')">🛒 Add</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="renderShops()" class="btn" style="background:#eee; margin-top:20px;">⬅️ Back</button>
        </div>
    `;
    window.scrollTo(0, 0);
}

function addToCart(foodId) {
    const food = foods.find(f => f.id === foodId);
    if (!food) return;
    
    const existingItem = cart.find(item => item.id === foodId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...food, quantity: 1});
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${food.name} cart එකට එකතු වුණා!`);
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function orderWhatsApp(shopId) {
    const shop = shops.find(s => s.id === shopId);
    const message = `*Order from FoodHub*\n\n*Shop:* ${shop.name}\n*Items:* ${cart.map(i => i.name).join(', ')}\n*Total:* Rs. ${cart.reduce((s, i) => s + i.price * i.quantity, 0)}`;
    window.open(`https://wa.me/94766488689?text=${encodeURIComponent(message)}`, '_blank');
}

function orderCall() {
    window.location.href = 'tel:+94766488689';
}

function openCheckout() {
    if (cart.length === 0) {
        showToast('❌ Cart එක හිස්!');
        return;
    }
    document.getElementById('checkoutModal').style.display = 'block';
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutItems').innerHTML = cart.map(item => `<div>${item.name} x${item.quantity} - Rs. ${item.price * item.quantity}</div>`).join('');
    document.getElementById('checkoutTotal').textContent = `Rs. ${total}`;
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
    if (!address) {
        showToast(' ලිපිනය ඇතුළත් කරන්න!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = {
        items: cart.map(i => i.name).join(', '),
        total: total,
        paymentMethod: selectedPaymentMethod,
        address: address,
        date: new Date().toISOString()
    };
    
    database.ref('orders').push(order);
    orders.push({...order, id: Date.now()});
    localStorage.setItem('orders', JSON.stringify(orders));
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    closeCheckout();
    showToast('✅ Order Confirmed!');
    renderOrders();
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    let html = '';
    if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        html += `<div style="background: #FFF0F0; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3>🛒 Your Cart</h3>
            ${cart.map(item => `<div>${item.name} x${item.quantity} - Rs. ${item.price * item.quantity}</div>`).join('')}
            <div style="font-weight:bold; font-size:18px; margin: 15px 0;">Total: Rs. ${total}</div>
            <button class="btn btn-primary" onclick="openCheckout()">Proceed to Checkout </button>
        </div>`;
    }
    
    if (orders.length === 0 && cart.length === 0) {
        html += '<p style="text-align: center; color: #999; padding: 40px;">No orders yet</p>';
    } else {
        html += orders.map(order => `
            <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <div style="font-weight: bold;">Order #${order.id ? order.id.toString().slice(-6) : 'New'}</div>
                <div style="color: #666; font-size: 14px;">
                    <div>Items: ${order.items}</div>
                    <div>Total: Rs. ${order.total}</div>
                    <div>Payment: ${order.paymentMethod === 'cod' ? '💵 COD' : '🏦 Online'}</div>
                    <div>Date: ${new Date(order.date).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }
    ordersList.innerHTML = html;
}

function filterShops(term) {
    const filtered = shops.filter(shop => shop.name.toLowerCase().includes(term));
    document.getElementById('shopsList').innerHTML = filtered.map(shop => `
        <div class="shop-card" onclick="viewShop('${shop.id}')">
            <img src="${shop.image}" class="shop-image">
            <div class="shop-info">
                <div class="shop-name">${shop.name}</div>
                <div class="shop-tags">${(shop.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
        </div>
    `).join('');
}

function filterFoods(term) {
    const filtered = foods.filter(food => food.name.toLowerCase().includes(term));
    document.getElementById('foodsList').innerHTML = filtered.map(food => `
        <div class="food-card">
            <img src="${food.image}" class="food-image">
            <div class="food-info">
                <div class="food-name">${food.name}</div>
                <div class="food-price">Rs. ${food.price}</div>
                <button class="btn btn-primary" onclick="addToCart('${food.id}')">🛒 Add</button>
            </div>
        </div>
    `).join('');
}
