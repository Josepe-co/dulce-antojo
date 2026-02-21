/* ═══════════════════════════════════════════════
   DULCE ANTOJO — JAVASCRIPT PRINCIPAL
   ═══════════════════════════════════════════════ */

/* ── Configuración WhatsApp ── */
const WA_NUMBER   = "529631337896";   // Cambia a tu número
const DELIVERY_FEE = 15;              // Costo de envío a domicilio

/* ──────────────────────────────────────────────
   CATÁLOGO DE PRODUCTOS
   Para agregar un producto: crea un nuevo objeto
   con id, name, badge, description, emoji y variants.
   variants = [ ["Nombre", "$Precio"], ... ]
──────────────────────────────────────────────── */
const products = [
  {
    id: "frappe",
    name: "Frappé Helado",
    badge: "⭐ Popular",
    description: "Frappés cremosos y fríos preparados al momento con los mejores sabores.",
    emoji: "☕",
    variants: [
      ["Café clásico",    "$50"],
      ["Chocolate",       "$50"],
      ["Vainilla",        "$50"],
      ["Fresa",           "$55"],
      ["Matcha",          "$55"],
      ["Caramelo",        "$55"],
      ["Oreo",            "$60"],
      ["Nutella",         "$65"],
    ]
  },
  {
    id: "mini-hotcakes",
    name: "Mini Hotcakes",
    badge: "❤️ Favoritos",
    description: "Esponjosos y doraditos mini hotcakes con tus toppings favoritos.",
    emoji: "🥞",
    variants: [
      ["Naturales c/miel",  "$45"],
      ["Con fresas",        "$55"],
      ["Con Nutella",       "$60"],
      ["Con chispas",       "$55"],
      ["Con cajeta",        "$55"],
      ["Con nieve",         "$65"],
      ["Mixtos (todo)",     "$75"],
    ]
  },
  {
    id: "fresas-crema",
    name: "Fresas con Crema",
    badge: "🍓 Fresco",
    description: "Fresas frescas bañadas en crema suave con toppings a elegir.",
    emoji: "🍓",
    variants: [
      ["Clásicas",                 "$45"],
      ["Con granola",              "$55"],
      ["Con Nutella",              "$60"],
      ["Con chamoy y chile",       "$50"],
      ["Con leche condensada",     "$55"],
      ["Con nieve de vainilla",    "$65"],
    ]
  },
  {
    id: "paleta-fruta",
    name: "Paleta de Fruta",
    badge: "🧊 Helada",
    description: "Paletas artesanales de fruta natural, perfectas para el calor.",
    emoji: "🍡",
    variants: [
      ["Mango",     "$25"],
      ["Tamarindo", "$25"],
      ["Sandía",    "$25"],
      ["Melón",     "$25"],
      ["Jamaica",   "$25"],
      ["Limón",     "$25"],
      ["Mango-chamoy", "$30"],
    ]
  },
  {
    id: "gelatina",
    name: "Gelatina de Mosaico",
    badge: "🌈 Colorida",
    description: "Gelatinas de colores vibrantes, elaboradas con amor para compartir.",
    emoji: "🍮",
    variants: [
      ["Individual",      "$35"],
      ["Caja de 6 pzs",   "$180"],
      ["Caja de 12 pzs",  "$340"],
    ]
  },
  {
    id: "smoothie",
    name: "Smoothie Frío",
    badge: "🥤 Refrescante",
    description: "Smoothies espesos y frescos, preparados al momento con fruta real.",
    emoji: "🥤",
    variants: [
      ["Fresa-Plátano",     "$55"],
      ["Mango-Maracuyá",    "$55"],
      ["Mixto Tropical",    "$60"],
      ["Verde Detox",       "$60"],
      ["Frutos Rojos",      "$60"],
    ]
  },
];

/* ──────────────────────────────────────────────
   ESTADO GLOBAL
──────────────────────────────────────────────── */
let currentProduct       = null;
let selectedVariantIndex = 0;
let currentQty           = 1;
let cart                 = [];

/* ──────────────────────────────────────────────
   RENDERIZADO DEL CATÁLOGO
──────────────────────────────────────────────── */
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card reveal";

    const priceRows = prod.variants
      .map(v => `
        <div class="price-row">
          <span class="variant-name">${v[0]}</span>
          <span class="variant-price">${v[1]}</span>
        </div>`)
      .join("");

    card.innerHTML = `
      <div class="card-img-wrap">
        <span class="card-emoji">${prod.emoji}</span>
        ${prod.badge ? `<span class="card-badge">${prod.badge}</span>` : ""}
      </div>
      <div class="card-body">
        <h3 class="card-name">${prod.name}</h3>
        <p class="card-desc">${prod.description}</p>
        <button
          class="accordion-btn"
          aria-expanded="false"
          data-acc="${prod.id}"
        >
          <span>Ver precios</span>
          <span class="accordion-arrow">▼</span>
        </button>
        <div class="accordion-body" id="acc-${prod.id}">
          ${priceRows}
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-order" onclick="openOrderModal('${prod.id}')">
          Pedir ahora 🛵
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Activar scroll reveal en las tarjetas recién creadas
  observeReveal();
  // Activar acordeones
  bindAccordions();
}

/* ──────────────────────────────────────────────
   ACORDEONES DE PRECIOS
──────────────────────────────────────────────── */
function bindAccordions() {
  document.querySelectorAll(".accordion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id   = btn.dataset.acc;
      const body = document.getElementById(`acc-${id}`);
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Cierra todos
      document.querySelectorAll(".accordion-btn").forEach(b => {
        b.setAttribute("aria-expanded", "false");
        const bodyId = b.dataset.acc;
        document.getElementById(`acc-${bodyId}`)?.classList.remove("open");
      });

      // Abre el clickeado si estaba cerrado
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        body?.classList.add("open");
      }
    });
  });
}

/* ──────────────────────────────────────────────
   MODAL DE PRODUCTO
──────────────────────────────────────────────── */
const orderOverlay  = document.getElementById("orderOverlay");
const variantsWrap  = document.getElementById("variantsWrap");
const qtyDisplay    = document.getElementById("qtyDisplay");
const modalSubtotal = document.getElementById("modalSubtotal");

function openOrderModal(productId) {
  currentProduct       = products.find(p => p.id === productId);
  selectedVariantIndex = 0;
  currentQty           = 1;

  if (!currentProduct) return;

  document.getElementById("modalProductName").textContent = currentProduct.name;
  renderVariants();
  updateSubtotal();
  setDulcyState("normal", "modal");
  document.getElementById("dulcyModalMsg").textContent = "¡Elige lo que más se te antoje! 💜";

  orderOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeOrderModal() {
  orderOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function renderVariants() {
  variantsWrap.innerHTML = "";
  currentProduct.variants.forEach((v, i) => {
    const chip = document.createElement("button");
    chip.className = "variant-chip" + (i === selectedVariantIndex ? " active" : "");
    chip.innerHTML = `<span>${v[0]}</span> <strong>${v[1]}</strong>`;
    chip.addEventListener("click", () => {
      selectedVariantIndex = i;
      renderVariants();
      updateSubtotal();
    });
    variantsWrap.appendChild(chip);
  });
}

function updateSubtotal() {
  const priceStr = currentProduct.variants[selectedVariantIndex][1];
  const price    = parseInt(priceStr.replace(/\D/g, ""), 10);
  modalSubtotal.textContent = `$${price * currentQty}`;
}

// Controles de cantidad (modal producto)
document.getElementById("qtyMinus").addEventListener("click", () => {
  if (currentQty > 1) { currentQty--; qtyDisplay.textContent = currentQty; updateSubtotal(); }
});
document.getElementById("qtyPlus").addEventListener("click", () => {
  if (currentQty < 20) { currentQty++; qtyDisplay.textContent = currentQty; updateSubtotal(); }
});

// Agregar al carrito
document.getElementById("addToCartBtn").addEventListener("click", () => {
  if (!currentProduct) return;

  const variant = currentProduct.variants[selectedVariantIndex];
  const key     = `${currentProduct.id}__${selectedVariantIndex}`;
  const existing = cart.find(c => c.key === key);

  if (existing) {
    existing.qty = Math.min(existing.qty + currentQty, 20);
  } else {
    cart.push({
      key,
      productId:   currentProduct.id,
      productName: currentProduct.name,
      variant,
      qty: currentQty,
    });
  }

  updateCartBadge();
  closeOrderModal();
  setDulcyState("happy", "floating");

  const msgs = [
    "¡Listo! Agregado al pedido 🛒",
    "¡Va para adentro! 💜",
    "¡Buena elección! 😋",
    "¡Sigue pidiendo! 🎉",
    "¡Qué rico antojo! 🍓",
  ];
  showDulcyBubble(msgs[Math.floor(Math.random() * msgs.length)]);

  setTimeout(() => setDulcyState("normal", "floating"), 2800);
});

// Cerrar modal producto
document.getElementById("closeOrderModal").addEventListener("click", closeOrderModal);
orderOverlay.addEventListener("click", e => { if (e.target === orderOverlay) closeOrderModal(); });

/* ──────────────────────────────────────────────
   MODAL DEL CARRITO
──────────────────────────────────────────────── */
const cartOverlay      = document.getElementById("cartOverlay");
const cartItemsWrap    = document.getElementById("cartItemsWrap");
const cartTotalEl      = document.getElementById("cartTotal");

function openCartModal() {
  renderCartItems();
  updateCartTotal();
  setDulcyState("normal", "cart");
  document.getElementById("dulcyCartMsg").textContent = "¡Aquí está tu pedido! 🛒";
  cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCartModal() {
  cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function renderCartItems() {
  cartItemsWrap.innerHTML = "";

  if (cart.length === 0) {
    cartItemsWrap.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío.<br/>¡Agrega algo rico!</p>
      </div>`;
    document.getElementById("sendOrderBtn").disabled = true;
    document.getElementById("sendOrderBtn").style.opacity = ".5";
    document.getElementById("sendOrderBtn").style.cursor = "not-allowed";
    return;
  }

  document.getElementById("sendOrderBtn").disabled = false;
  document.getElementById("sendOrderBtn").style.opacity = "1";
  document.getElementById("sendOrderBtn").style.cursor = "pointer";

  cart.forEach(item => {
    const price = parseInt(item.variant[1].replace(/\D/g, ""), 10);
    const row   = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.productName}</div>
        <div class="cart-item-variant">${item.variant[0]}</div>
        <div class="cart-item-unit">${item.variant[1]} c/u</div>
      </div>
      <div class="cart-item-qty">
        <button class="cart-qty-btn" data-key="${item.key}" data-action="minus">−</button>
        <span class="cart-qty-num">${item.qty}</span>
        <button class="cart-qty-btn" data-key="${item.key}" data-action="plus">+</button>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-total">$${price * item.qty}</span>
        <button class="cart-remove" data-key="${item.key}" title="Eliminar">✕</button>
      </div>
    `;
    cartItemsWrap.appendChild(row);
  });

  // Bind botones de cantidad y eliminar
  cartItemsWrap.querySelectorAll(".cart-qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key    = btn.dataset.key;
      const action = btn.dataset.action;
      const idx    = cart.findIndex(c => c.key === key);
      if (idx === -1) return;

      if (action === "plus") {
        cart[idx].qty = Math.min(cart[idx].qty + 1, 20);
      } else {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      updateCartBadge();
      renderCartItems();
      updateCartTotal();
    });
  });

  cartItemsWrap.querySelectorAll(".cart-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      cart = cart.filter(c => c.key !== btn.dataset.key);
      updateCartBadge();
      renderCartItems();
      updateCartTotal();
    });
  });
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => {
    const price = parseInt(item.variant[1].replace(/\D/g, ""), 10);
    return sum + price * item.qty;
  }, 0);
  cartTotalEl.textContent = `$${total}`;
}

function updateCartBadge() {
  const fab   = document.getElementById("fabCart");
  const badge = document.getElementById("fabBadge");
  const total = cart.reduce((s, c) => s + c.qty, 0);
  if (total > 0) {
    fab.style.display = "flex";
    badge.textContent = total;
    badge.style.animation = "none";
    void badge.offsetWidth;
    badge.style.animation = "badgePop .3s cubic-bezier(.4,0,.2,1)";
  } else {
    fab.style.display = "none";
  }
}

// ENVIAR PEDIDO POR WHATSAPP
document.getElementById("sendOrderBtn").addEventListener("click", () => {
  if (cart.length === 0) return;

  const notes = document.getElementById("notesInput").value.trim();

  // Construir mensaje
  let msg = `¡Hola Dulce Antojo! 🍬 Quiero hacer un pedido:\n\n`;
  cart.forEach((item, i) => {
    const price = parseInt(item.variant[1].replace(/\D/g, ""), 10);
    msg += `${i + 1}. *${item.productName}* – ${item.variant[0]} × ${item.qty} = $${price * item.qty}\n`;
  });
  msg += "\n";

  const total = cart.reduce((s, c) => s + parseInt(c.variant[1].replace(/\D/g, ""), 10) * c.qty, 0);

  msg += `🏠 *Recoger en tienda*\n`;
  msg += `💰 *Total:* $${total}\n`;
  if (notes) msg += `📝 *Notas:* ${notes}\n`;

  // Dulcy feliz
  setDulcyState("happy", "cart");
  setDulcyState("happy", "floating");
  showDulcyBubble("¡Pedido enviado! 🎉 ¡Gracias!");

  setTimeout(() => {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    // Limpiar
    cart = [];
    updateCartBadge();
    closeCartModal();
    document.getElementById("notesInput").value = "";

    setTimeout(() => {
      setDulcyState("normal", "floating");
      setDulcyState("normal", "cart");
    }, 3000);
  }, 900);
});

// FAB Carrito
document.getElementById("fabCart").addEventListener("click", openCartModal);

// Cerrar modal carrito
document.getElementById("closeCartModal").addEventListener("click", closeCartModal);
cartOverlay.addEventListener("click", e => { if (e.target === cartOverlay) closeCartModal(); });

// Tecla ESC cierra cualquier modal
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeOrderModal();
    closeCartModal();
  }
});

/* ──────────────────────────────────────────────
   DULCY — MASCOTA
──────────────────────────────────────────────── */
const dulcyPhrases = [
  "¿Qué se te antoja hoy? 😋",
  "¡Los frapés están increíbles! ☕",
  "¡Pide lo que quieras, todo está rico! 💜",
  "Las fresas con crema están 🍓🔥",
  "¡Los mini hotcakes son una delicia! 🥞",
  "¿Ya viste nuestras paletas? 🧊",
];
let dulcyPhraseIdx = 0;

function setDulcyState(state, target) {
  const imgIds = {
    floating: "dulcyImg",
    modal:    "dulcyModalImg",
    cart:     "dulcyCartImg",
  };
  const el = document.getElementById(imgIds[target]);
  if (!el) return;

  if (state === "happy") {
    el.classList.add("dulcy-happy-state");
    bounceDulcyEl(el);
  } else {
    el.classList.remove("dulcy-happy-state");
  }
}

function bounceDulcyEl(el) {
  if (!el) return;
  el.classList.remove("dulcy-bounce");
  void el.offsetWidth;
  el.classList.add("dulcy-bounce");
  el.addEventListener("animationend", () => el.classList.remove("dulcy-bounce"), { once: true });
}

function showDulcyBubble(text) {
  const bubble = document.getElementById("dulcyBubble");
  bubble.textContent = text;
  bubble.classList.add("show");
  clearTimeout(showDulcyBubble._timer);
  showDulcyBubble._timer = setTimeout(() => bubble.classList.remove("show"), 3400);
}

// Clic en Dulcy flotante
const dulcyChar = document.getElementById("dulcyChar");
const dulcyImgEl = document.getElementById("dulcyImg");
dulcyChar.addEventListener("click", () => {
  showDulcyBubble(dulcyPhrases[dulcyPhraseIdx % dulcyPhrases.length]);
  dulcyPhraseIdx++;
  bounceDulcyEl(dulcyImgEl);
});
dulcyChar.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") dulcyChar.click();
});

// Saludo inicial de Dulcy después de 2.5 segundos
setTimeout(() => {
  showDulcyBubble("¡Hola! Soy Dulcy 💜 ¿En qué te ayudo?");
}, 2500);

/* ──────────────────────────────────────────────
   NAVBAR — SCROLL & HAMBURGUESA
──────────────────────────────────────────────── */
const navbar    = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  if (window.scrollY > 30) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Active link
  const sections = document.querySelectorAll("section[id]");
  sections.forEach(sec => {
    const top    = sec.offsetTop - 80;
    const bottom = top + sec.offsetHeight;
    const link   = navLinks.querySelector(`a[href="#${sec.id}"]`);
    if (link) {
      if (window.scrollY >= top && window.scrollY < bottom) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  });
}, { passive: true });

hamburger.addEventListener("click", () => {
  const expanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", String(!expanded));
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});

// Cerrar menú al hacer clic en un link
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  });
});

/* ──────────────────────────────────────────────
   SMOOTH SCROLL (fallback)
──────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ──────────────────────────────────────────────
   SCROLL REVEAL con IntersectionObserver
──────────────────────────────────────────────── */
function observeReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal:not(.visible)").forEach(el => io.observe(el));
}

/* ──────────────────────────────────────────────
   INICIALIZACIÓN
──────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  observeReveal();
});
