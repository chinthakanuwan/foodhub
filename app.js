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
let groceryItems = [];
let cart = [];
let selectedGroceryIds = new Set();
let currentShopId = null; // To track if we are viewing a specific shop

// 42 Sample Grocery Items
const sampleGroceryItems = [
    { id: '1', name: 'සීනි (Sugar)', unit: '1kg', price: 280, category: 'Staples', image: 'https://images.unsplash.com/photo-1589894117408-6b8915a89915?w=500' },
    { id: '2', name: 'පරිප්පු (Dhal)', unit: '1kg', price: 450, category: 'Staples', image: 'https://images.unsplash.com/photo-1587314168485-323f39f5441b?w=500' },
    { id: '3', name: 'කිරි පිටි (Milk Powder)', unit: '400g', price: 650, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500' },
    { id: '4', name: 'සහල් (Rice)', unit: '1kg', price: 220, category: 'Staples', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500' },
    { id: '5', name: 'තෙල් (Oil)', unit: '1L', price: 550, category: 'Cooking', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' },
    { id: '6', name: 'ලුණු (Salt)', unit: '500g', price: 90, category: 'Spices', image: 'https://images.unsplash.com/photo-1615485904265-29330f2073bd?w=500' },
    { id: '7', name: 'මිරිස් කුඩු (Chili Powder)', unit: '100g', price: 180, category: 'Spices', image: 'https://images.unsplash.com/photo-1596040071240-08301a74781c?w=500' },
    { id: '8', name: 'කහ කුඩු (Turmeric)', unit: '100g', price: 150, category: 'Spices', image: 'https://images.unsplash.com/photo-1615485297392-60cb4549853c?w=500' },
    { id: '9', name: 'කෝපි (Coffee)', unit: '100g', price: 350, category: 'Beverages', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500' },
    { id: '10', name: 'තේ (Tea)', unit: '250g', price: 280, category: 'Beverages', image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500' },
    { id: '11', name: 'බිස්කට් (Biscuits)', unit: 'Pack', price: 120, category: 'Snacks', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500' },
    { id: '12', name: 'පාන් (Bread)', unit: 'Loaf', price: 80, category: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' },
    { id: '13', name: 'බිත්තර (Eggs)', unit: '10 pcs', price: 180, category: 'Dairy', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500' },
    { id: '14', name: 'කිරි (Milk)', unit: '1L', price: 180, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500' },
    { id: '15', name: 'කොකෝවා (Coca-Cola)', unit: '330ml', price: 120, category: 'Beverages', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
    { id: '16', name: 'Sprite', unit: '330ml', price: 120, category: 'Beverages', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500' },
    { id: '17', name: 'මැගී (Maggi)', unit: 'Pack', price: 90, category: 'Instant', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500' },
    { id: '18', name: 'පාන් පිටි (Flour)', unit: '1kg', price: 180, category: 'Staples', image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500' },
    { id: '19', name: 'සම්බාර (Curry Powder)', unit: '100g', price: 150, category: 'Spices', image: 'https://images.unsplash.com/photo-1596040071240-08301a74781c?w=500' },
    { id: '20', name: 'ගම්මිරිස් (Pepper)', unit: '100g', price: 280, category: 'Spices', image: 'https://images.unsplash.com/photo-1596040071240-08301a74781c?w=500' },
    { id: '21', name: 'ටිෂූ පේපර් (Tissue)', unit: 'Pack', price: 150, category: 'Household', image: 'https://images.unsplash.com/photo-1584308666744-23d26a3be0cd?w=500' },
    { id: '22', name: 'ඩිටර්ජන්ට් (Detergent)', unit: '500g', price: 280, category: 'Household', image: 'https://images.unsplash.com/photo-1583939003579-136eed73459e?w=500' },
    { id: '23', name: 'සෝයා සෝස් (Soy Sauce)', unit: '250ml', price: 220, category: 'Cooking', image: 'https://images.unsplash.com/photo-1551650975-8744e71348b3?w=500' },
    { id: '24', name: 'ටොමැටෝ සෝස් (Tomato Sauce)', unit: '300ml', price: 180, category: 'Condiments', image: 'https://images.unsplash.com/photo-1571167189043-171f75ae3721?w=500' },
    { id: '25', name: 'චිප්ස් (Chips)', unit: 'Pack', price: 80, category: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-e84c6f748f25?w=500' },
    { id: '26', name: 'චොකලට් (Chocolate)', unit: 'Bar', price: 150, category: 'Snacks', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500' },
    { id: '27', name: 'ජූස් (Juice)', unit: '1L', price: 280, category: 'Beverages', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500' },
    { id: '28', name: 'වාටර් (Water)', unit: '1.5L', price: 80, category: 'Beverages', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500' },
    { id: '29', name: 'නූඩ්ල්ස් (Noodles)', unit: 'Pack', price: 120, category: 'Instant', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500' },
    { id: '30', name: 'පේස්ටා (Pasta)', unit: '500g', price: 280, category: 'Staples', image: 'https://images.unsplash.com/photo-1551183054-bf91ab1f3053?w=500' },
    { id: '31', name: 'කැන්ඩි (Candy)', unit: 'Pack', price: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1582058091535-435ac4590799?w=500' },
    { id: '32', name: 'සබ්බැඳි (Soap)', unit: '100g', price: 95, category: 'Personal', image: 'https://images.unsplash.com/photo-1600857062241-97de8a795b52?w=500' },
    { id: '33', name: 'ටූත්පේස්ට් (Toothpaste)', unit: '100g', price: 180, category: 'Personal', image: 'https://images.unsplash.com/photo-1559671816-6222e982d963?w=500' },
    { id: '34', name: 'ෂැම්පු (Shampoo)', unit: '200ml', price: 350, category: 'Personal', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500' },
    { id: '35', name: 'කොට්ටේ (Cotton)', unit: 'Pack', price: 85, category: 'Personal', image: 'https://images.unsplash.com/photo-1583939003579-136eed73459e?w=500' },
    { id: '36', name: 'කරපිංචා (Mustard)', unit: '100g', price: 120, category: 'Spices', image: 'https://images.unsplash.com/photo-1615485297392-60cb4549853c?w=500' },
    { id: '37', name: 'මාලු මිරිස් (Fish)', unit: '200g', price: 350, category: 'Canned', image: 'https://images.unsplash.com/photo-1534939561146-6946c0a9b1d4?w=500' },
    { id: '38', name: 'කොකනට් මිල්ක් (Coconut Milk)', unit: '400ml', price: 150, category: 'Cooking', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500' },
    { id: '39', name: 'රයිස් (Rice) 5kg', unit: '5kg', price: 950, category: 'Staples', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500' },
    { id: '40', name: 'කිරි පිටි (Milk Powder) 900g', unit: '900g', price: 1250, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500' },
    { id: '41', name: 'කැනඩ් ෆිෂ් (Canned Fish)', unit: '155g', price: 280, category: 'Canned', image: 'https://images.unsplash.com/photo-1534939561146-6946c0a9b1d4?w=500' },
    { id: '42', name: 'කැනඩ් බීන්ස් (Canned Beans)', unit: '400g', price: 220, category: 'Canned', image: 'https://images.unsplash.com/photo-1589894117408-6b8915a89915?w=500' }
];

document.addEventListener('DOMContentLoaded', () => {
    loadShops();
    loadFoods();
    loadGroceryItems();
});

function loadShops() {
    database.ref('shops').on('value', (snapshot) => {
        const data = snapshot.val();
        shops = data ? Object.entries(data).map(([key, value]) => ({...value, id: key})) : [];
        renderShops();
    });
}

function loadFoods() {
    database.ref('foods').on('value', (snapshot) => {
        const data = snapshot.val();
        foods = data ? Object.entries(data).map(([key, value]) => ({...value, id: key})) : [];
        renderFoods();
    });
}

function loadGroceryItems() {
    // Always start with sample items to guarantee they show up immediately
    groceryItems = [...sampleGroceryItems];
    renderGroceryGrid();

    // Then listen to Firebase for any additional items added via Admin Panel
    database.ref('groceryItems').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const adminItems = Object.entries(data).map(([key, value]) => ({...value, id: key}));
            const combined = [...sampleGroceryItems];
            adminItems.forEach(adminItem => {
                const exists = combined.find(i => i.id === adminItem.id);
                if (!exists) combined.push(adminItem);
                else {
                    const index = combined.findIndex(i => i.id === adminItem.id);
                    combined[index] = adminItem;
                }
            });
            groceryItems = combined;
            renderGroceryGrid();
        }
    });
}

function renderShops() {
    const list = document.getElementById('shopsList');
    if (shops.length === 0) { list.innerHTML = '<div class="loading">දැනට Shops කිසිවක් නැත.</div>'; return; }
    list.innerHTML = shops.map(shop => `
        <div class="shop-card" onclick="openShopView('${shop.id}')">
            <img src="${shop.image || 'https://via.placeholder.com/400x200?text=No+Image'}" class="shop-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
            <div class="shop-info">
                <div class="shop-name">${shop.name} ${shop.isFeatured ? '⭐' : ''}</div>
                <div class="shop-details"><span>📞 ${shop.phone || 'N/A'}</span><span class="rating">⭐ ${shop.rating || '4.0'}</span></div>
                <div class="shop-details">🕐 ${shop.openTime || '09:00'} - ${shop.closeTime || '22:00'}</div>
                ${shop.tags ? `<div class="shop-tags">${shop.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function openShopView(shopId) {
    currentShopId = shopId;
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
        document.getElementById('currentShopName').textContent = shop.name + " 🍽️";
        document.getElementById('shopViewHeader').style.display = 'block';
    }
    switchTab('foods'); // Automatically switch to foods tab to show this shop's items
}

function backToShops() {
    currentShopId = null;
    document.getElementById('shopViewHeader').style.display = 'none';
    switchTab('shops');
}

function renderFoods() {
    const list = document.getElementById('foodsList');
    let displayFoods = foods;
    
    // Filter foods by current shop if viewing a specific shop
    if (currentShopId) {
        displayFoods = foods.filter(f => f.shopId === currentShopId);
    }

    if (displayFoods.length === 0) { 
        list.innerHTML = `<div class="loading">${currentShopId ? 'මේ කඩේ Foods තවම නැහැ.' : 'දැනට Foods කිසිවක් නැත.'}</div>`; 
        return; 
    }
    
    list.innerHTML = displayFoods.map(food => {
        const shop = shops.find(s => s.id === food.shopId);
        return `
            <div class="food-card">
                <img src="${food.image || 'https://via.placeholder.com/400x120?text=No+Image'}" class="food-image" onerror="this.src='https://via.placeholder.com/400x120?text=No+Image'">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div style="font-size:12px; color:#666; margin-bottom:5px;">${shop ? shop.name : 'Unknown'}</div>
                    <div class="food-price">Rs. ${food.price}</div>
                    <button class="btn btn-primary" onclick="addToCart('${food.id}', '${food.name}', ${food.price})">🛒 Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderGroceryGrid() {
    const grid = document.getElementById('groceryGrid');
    if (groceryItems.length === 0) {
        grid.innerHTML = '<div class="loading">දැනට Grocery භාණ්ඩ කිසිවක් නැත.</div>';
        updateGroceryCart();
        return;
    }
    grid.innerHTML = groceryItems.map(product => `
        <div class="grocery-card ${selectedGroceryIds.has(product.id) ? 'selected' : ''}" onclick="toggleGroceryItem('${product.id}')">
            <div class="grocery-check"><input type="checkbox" ${selectedGroceryIds.has(product.id) ? 'checked' : ''}></div>
            <img src="${product.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${product.name}" class="grocery-img" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            <div class="grocery-info">
                <div class="grocery-name">${product.name}</div>
                <div class="grocery-qty">${product.unit || ''}</div>
                <div class="grocery-price">Rs. ${product.price}</div>
            </div>
        </div>
    `).join('');
    updateGroceryCart();
}

function toggleGroceryItem(id) {
    if (selectedGroceryIds.has(id)) selectedGroceryIds.delete(id);
    else selectedGroceryIds.add(id);
    renderGroceryGrid();
}

function updateGroceryCart() {
    let total = 0, count = 0;
    selectedGroceryIds.forEach(id => {
        const item = groceryItems.find(g => g.id === id);
        if (item) { total += (item.price || 0); count++; }
    });
    document.getElementById('groceryCount').textContent = count;
    document.getElementById('groceryTotal').textContent = total.toLocaleString();
    document.getElementById('groceryCart').style.display = count > 0 ? 'block' : 'none';
}

function confirmGroceryOrder() {
    let itemsList = [], total = 0;
    const name = document.getElementById('customerName')?.value || 'Customer';
    const phone = document.getElementById('phoneNumber')?.value || 'N/A';
    const address = document.getElementById('deliveryAddress')?.value || 'N/A';

    selectedGroceryIds.forEach(id => {
        const item = groceryItems.find(g => g.id === id);
        if (item) { itemsList.push(`✓ ${item.name} (${item.unit}) - Rs. ${item.price}`); total += (item.price || 0); }
    });

    const orderMsg = `*🛒 FoodHub Grocery Order*\n\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📍 *Address:* ${address}\n\n*භාණ්ඩ:*\n${itemsList.join('\n')}\n\n*💰 මුළු මුදල:* Rs. ${total.toLocaleString()}\n\nකරුණාකර මෙම order එක තහවුරු කරන්න.`;
    
    window.open(`https://wa.me/94766488689?text=${encodeURIComponent(orderMsg)}`, '_blank');
    selectedGroceryIds.clear();
    renderGroceryGrid();
    showToast('✅ WhatsApp එකට යවන ලදී!');
}

function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity++;
    else cart.push({ id, name, price, quantity: 1 });
    updateCartBadge();
    showToast('✅ Cart එකට එකතු විය!');
}

function updateCartBadge() {
    document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderOrdersTab() {
    const list = document.getElementById('ordersList');
    const checkoutSection = document.getElementById('checkoutSection');
    if (cart.length === 0) {
        list.innerHTML = '<div class="loading">🛒 ඔබේ Cart එක හිස්යි</div>';
        checkoutSection.style.display = 'none';
        return;
    }
    let total = 0;
    list.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div><div style="font-weight: 600;">${item.name}</div><div style="font-size: 12px; color: #666;">Rs. ${item.price} x ${item.quantity}</div></div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="changeQty('${item.id}', -1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">-</button>
                    <span style="font-weight: 600;">${item.quantity}</span>
                    <button onclick="changeQty('${item.id}', 1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">+</button>
                    <button onclick="removeFromCart('${item.id}')" style="margin-left: 10px; background: #f44336; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('cartTotalDisplay').textContent = 'Rs. ' + total.toLocaleString();
    checkoutSection.style.display = 'block';
}

function changeQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) removeFromCart(id);
        else { updateCartBadge(); renderOrdersTab(); }
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartBadge();
    renderOrdersTab();
}

function selectPayment(method) {
    document.getElementById('btn-cod').classList.toggle('active', method === 'cod');
    document.getElementById('btn-online').classList.toggle('active', method === 'online');
    document.getElementById('onlinePaymentDetails').style.display = method === 'online' ? 'block' : 'none';
}

function confirmCartOrder() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const address = document.getElementById('deliveryAddress').value.trim();
    const paymentMethod = document.getElementById('btn-online').classList.contains('active') ? 'online' : 'cod';
    const transId = document.getElementById('transactionId').value.trim();

    if (!name || !phone || !address) {
        showToast('❌ කරුණාකර නම, දුරකථන අංකය සහ ලිපිනය ඇතුළත් කරන්න!');
        return;
    }
    if (paymentMethod === 'online' && !transId) {
        showToast('❌ Online ගෙවීම් සඳහා Transaction ID එක අනිවාර්යයි!');
        return;
    }

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let itemsList = cart.map(i => `✓ ${i.name} x${i.quantity} (Rs. ${i.price * i.quantity})`).join('\n');
    const paymentInfo = paymentMethod === 'cod' ? '💵 Cash on Delivery' : `🏦 Online Payment (Ref: ${transId})`;

    const orderMsg = `*🍔 FoodHub New Order*\n\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📍 *Address:* ${address}\n💳 *Payment:* ${paymentInfo}\n\n*භාණ්ඩ:*\n${itemsList}\n\n*💰 මුළු මුදල:* Rs. ${total.toLocaleString()}\n\nකරුණාකර මෙම order එක තහවුරු කරන්න.`;
    
    window.open(`https://wa.me/94766488689?text=${encodeURIComponent(orderMsg)}`, '_blank');
    
    // Save to Firebase (Optional, for admin tracking)
    database.ref('orders').push({
        customerName: name, phone, address, paymentMethod, transactionId: transId,
        items: cart.map(i => i.name).join(', '), total, status: 'Pending', date: new Date().toISOString()
    });

    cart = []; updateCartBadge(); renderOrdersTab();
    document.getElementById('customerName').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('deliveryAddress').value = '';
    document.getElementById('transactionId').value = '';
    showToast('✅ Order එක සාර්ථකව යවන ලදී!');
}

function callToOrder() {
    window.location.href = 'tel:+94766488689';
}

function shareOnWhatsApp() {
    const text = "🍔 Check out FoodHub! Order delicious food and groceries online. Visit: https://chinthakanuwan.github.io/foodhub/";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareOnFacebook() {
    const url = "https://chinthakanuwan.github.io/foodhub/";
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnMessenger() {
    const url = "https://chinthakanuwan.github.io/foodhub/";
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID`, '_blank'); // Fallback to generic share if no app ID
}

function switchTab(tabName) {
    document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    const tabs = ['shops', 'grocery', 'foods', 'orders'];
    const index = tabs.indexOf(tabName);
    if (index >= 0) {
        document.querySelectorAll('.tab')[index].classList.add('active');
        document.querySelectorAll('.nav-item')[index].classList.add('active');
    }
    if (tabName === 'orders') renderOrdersTab();
    if (tabName === 'foods') renderFoods(); // Re-render to apply shop filter if active
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (query.length > 2) showToast('🔍 Searching for: ' + query);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
