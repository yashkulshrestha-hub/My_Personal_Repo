(() => {
  "use strict";

  // ---------- Product data ----------
  const products = [
    { id: 1, name: "Gold Hoodie", price: 89, tag: "Bestseller", img: "img/p1.png", category: "Apparel" },
    { id: 2, name: "Butter Cap", price: 39, tag: "New", img: "img/p2.png", category: "Accessories" },
    { id: 3, name: "Studio Tee", price: 49, tag: "", img: "img/p3.png", category: "Apparel" },
    { id: 4, name: "Desk Mat", price: 29, tag: "New", img: "img/p4.png", category: "Digital" },
    { id: 5, name: "Travel Mug", price: 34, tag: "", img: "img/p5.png", category: "Accessories" },
    { id: 6, name: "Edition Jacket", price: 149, tag: "Limited", img: "img/p6.png", category: "Limited" },
  ];

  const reviews = [
    { stars: 5, text: "Hands down the smoothest quality I've owned. The attention to detail is unreal — you can feel the difference.", name: "Maya R.", role: "Verified Buyer", initial: "M" },
    { stars: 5, text: "Shipping was lightning fast and the packaging made it feel like opening a gift. Already ordered two more pieces.", name: "Jonas T.", role: "Verified Buyer", initial: "J" },
    { stars: 5, text: "I've bought from a lot of stores — nothing compares. Buttery soft, premium finish, worth every cent.", name: "Priya S.", role: "Verified Buyer", initial: "P" },
  ];

  // ---------- Elements ----------
  const productGrid = document.getElementById("productGrid");
  const reviewsGrid = document.getElementById("reviewsGrid");
  const cartCount = document.getElementById("cartCount");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartBtn = document.getElementById("cartBtn");
  const closeCart = document.getElementById("closeCart");
  const scrim = document.getElementById("scrim");
  const checkoutBtn = document.getElementById("checkoutBtn");

  let cart = [];

  // ---------- Render products ----------
  productGrid.innerHTML = products.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-media">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.tag ? `<span class="product-tag ${p.tag === 'New' ? 'new' : ''}">${p.tag}</span>` : ""}
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <span class="price">$${p.price}</span>
      </div>
      <button class="add-btn" data-add="${p.id}">Add to cart</button>
    </article>
  `).join("");

  // ---------- Render reviews ----------
  reviewsGrid.innerHTML = reviews.map(r => `
    <article class="review-card">
      <div class="stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <p>“${r.text}”</p>
      <div class="author">
        <div class="avatar">${r.initial}</div>
        <div><strong>${r.name}</strong><span>${r.role}</span></div>
      </div>
    </article>
  `).join("");

  // ---------- Cart ----------
  function saveCart() { localStorage.setItem("studioCart", JSON.stringify(cart)); }
  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem("studioCart")) || []; } catch { cart = []; }
  }
  function updateCartUI() {
    const qty = cart.reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = qty;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartTotal.textContent = "$" + total;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<li class="cart-empty">Your bag is empty.</li>`;
    } else {
      cartItemsEl.innerHTML = cart.map(i => `
        <li class="cart-item" data-id="${i.id}">
          <img src="${i.img}" alt="${i.name}" />
          <div class="cart-item-info">
            <strong>${i.name}</strong>
            <span>$${i.price} × ${i.qty}</span>
          </div>
          <button class="rm" data-rm="${i.id}" aria-label="Remove">✕</button>
        </li>
      `).join("");
    }
  }
  function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const found = cart.find(i => i.id === id);
    if (found) found.qty++;
    else cart.push({ ...p, qty: 1 });
    saveCart(); updateCartUI(); openCart();
    flashCart();
  }
  function openCart() { cartDrawer.classList.add("open"); scrim.classList.add("show"); }
  function closeCartFn() { cartDrawer.classList.remove("open"); scrim.classList.remove("show"); }
  function flashCart() {
    cartBtn.classList.add("bump");
    setTimeout(() => cartBtn.classList.remove("bump"), 300);
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const rm = e.target.closest("[data-rm]");
    if (add) { addToCart(parseInt(add.dataset.add)); return; }
    if (rm) {
      const id = parseInt(rm.dataset.rm);
      cart = cart.filter(i => i.id !== id);
      saveCart(); updateCartUI();
    }
  });

  cartBtn.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartFn);
  scrim.addEventListener("click", closeCartFn);
  checkoutBtn.addEventListener("click", () => { alert("Checkout coming soon — thanks for shopping!"); closeCartFn(); });

  // ---------- Loader ----------
  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero");
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("hide");
      hero.classList.add("mask-done");
      setTimeout(() => loader.style.display = "none", 1200);
    }, 600);
    hero.classList.add("mask-done");
    [...document.querySelectorAll(".hero .reveal")].forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 500 + i * 150);
    });
    animateReveals();
  });

  // ---------- Toggle to show hero reveals immediately if load already fired ----------
  if (document.readyState === "complete") {
    document.querySelectorAll(".hero .reveal").forEach((el, i) => setTimeout(() => el.classList.add("in"), 300 + i * 150));
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  function animateReveals() {
    document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));
  }
  animateReveals();

  // ---------- Menu overlay ----------
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("overlay");
  menuBtn.addEventListener("click", () => {
    const open = overlay.classList.toggle("open");
    menuBtn.classList.toggle("active", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  overlay.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    overlay.classList.remove("open");
    menuBtn.classList.remove("active");
    document.body.style.overflow = "";
  }));

  // ---------- Floating bar hide on scroll down ----------
  const floatingBar = document.getElementById("floatingBar");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > lastY && y > 400) floatingBar.classList.add("hide");
    else floatingBar.classList.remove("hide");
    lastY = y;
  });

  // ---------- Header background on scroll ----------
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 600) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });

  // ---------- Newsletter ----------
  const newsForm = document.getElementById("newsForm");
  const formOk = document.getElementById("formOk");
  newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formOk.classList.add("show");
    newsForm.reset();
  });

  // ---------- Init ----------
  loadCart();
  updateCartUI();
})();
