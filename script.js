// Product Listing Application
class ProductListing {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentPage = 1;
    this.productsPerPage = 6;
    this.currentView = "grid";
    this.currentProductIndex = 0;

    this.init();
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
    this.populateFilters();
    this.renderProducts();
    this.updateProductCounter();
    this.renderPagination();
  }

  async loadProducts() {
    try {
      const response = await fetch("products.json");
      this.products = await response.json();
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error("Error loading products:", error);
      this.showError("Failed to load products. Please try again later.");
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search");
    searchInput.addEventListener(
      "input",
      this.debounce((e) => {
        this.filterProducts();
      }, 300)
    );

    // Filter controls
    document.getElementById("owner-filter").addEventListener("change", () => {
      this.filterProducts();
    });

    document.getElementById("price-filter").addEventListener("change", () => {
      this.filterProducts();
    });

    document.getElementById("clear-filters").addEventListener("click", () => {
      this.clearFilters();
    });

    // Navigation controls
    document.getElementById("prev-product").addEventListener("click", () => {
      this.previousProduct();
    });

    document.getElementById("next-product").addEventListener("click", () => {
      this.nextProduct();
    });

    // View toggle
    document.getElementById("grid-view").addEventListener("click", () => {
      this.setView("grid");
    });

    document.getElementById("list-view").addEventListener("click", () => {
      this.setView("list");
    });

    // Pagination
    document.getElementById("first-page").addEventListener("click", () => {
      this.goToPage(1);
    });

    document.getElementById("prev-page").addEventListener("click", () => {
      this.goToPage(this.currentPage - 1);
    });

    document.getElementById("next-page").addEventListener("click", () => {
      this.goToPage(this.currentPage + 1);
    });

    document.getElementById("last-page").addEventListener("click", () => {
      this.goToPage(this.getTotalPages());
    });

    // Modal controls
    document.getElementById("product-modal").addEventListener("click", (e) => {
      if (e.target.id === "product-modal") {
        this.closeModal();
      }
    });

    document.querySelector(".modal-close").addEventListener("click", () => {
      this.closeModal();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      } else if (e.key === "ArrowLeft") {
        this.previousProduct();
      } else if (e.key === "ArrowRight") {
        this.nextProduct();
      }
    });

    // Scroll to top functionality
    const scrollToTopBtn = document.getElementById("scroll-to-top");
    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Show/hide scroll to top button
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.remove("hidden");
      } else {
        scrollToTopBtn.classList.add("hidden");
      }
    });
  }

  populateFilters() {
    const ownerFilter = document.getElementById("owner-filter");
    const owners = [...new Set(this.products.map((product) => product.owner))];

    owners.forEach((owner) => {
      const option = document.createElement("option");
      option.value = owner;
      option.textContent = owner;
      ownerFilter.appendChild(option);
    });
  }

  filterProducts() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const ownerFilter = document.getElementById("owner-filter").value;
    const priceFilter = document.getElementById("price-filter").value;

    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.owner.toLowerCase().includes(searchTerm) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm));

      const matchesOwner = !ownerFilter || product.owner === ownerFilter;

      let matchesPrice = true;
      if (priceFilter) {
        const price = product.price;
        switch (priceFilter) {
          case "0-25":
            matchesPrice = price <= 25;
            break;
          case "25-50":
            matchesPrice = price > 25 && price <= 50;
            break;
          case "50-100":
            matchesPrice = price > 50 && price <= 100;
            break;
          case "100+":
            matchesPrice = price > 100;
            break;
        }
      }

      return matchesSearch && matchesOwner && matchesPrice;
    });

    this.currentPage = 1;
    this.currentProductIndex = 0;
    this.renderProducts();
    this.updateProductCounter();
    this.renderPagination();
    this.updateNavigationButtons();
  }

  clearFilters() {
    document.getElementById("search").value = "";
    document.getElementById("owner-filter").value = "";
    document.getElementById("price-filter").value = "";

    this.filteredProducts = [...this.products];
    this.currentPage = 1;
    this.currentProductIndex = 0;
    this.renderProducts();
    this.updateProductCounter();
    this.renderPagination();
    this.updateNavigationButtons();
  }

  renderProducts() {
    const container = document.getElementById("products-container");
    const loading = document.getElementById("loading");
    const noProducts = document.getElementById("no-products");

    // Show loading state
    loading.classList.remove("hidden");
    container.innerHTML = "";
    noProducts.classList.add("hidden");

    setTimeout(() => {
      loading.classList.add("hidden");

      if (this.filteredProducts.length === 0) {
        noProducts.classList.remove("hidden");
        return;
      }

      // Calculate pagination
      const startIndex = (this.currentPage - 1) * this.productsPerPage;
      const endIndex = startIndex + this.productsPerPage;
      const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

      // Set container class based on view
      container.className =
        this.currentView === "grid" ? "products-grid" : "products-list";

      // Render products
      productsToShow.forEach((product, index) => {
        const productCard = this.createProductCard(product, index);
        container.appendChild(productCard);
      });

      // Add click listeners to product cards
      container.querySelectorAll(".product-card").forEach((card, index) => {
        card.addEventListener("click", () => {
          const productIndex = startIndex + index;
          this.showProductModal(this.filteredProducts[productIndex]);
        });
      });
    }, 500); // Simulate loading time
  }

createProductCard(product, index) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.style.animationDelay = `${index * 100}ms`;

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
    <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-owner">by ${product.owner}</p>
        <p class="product-price">$${product.price.toFixed(2)}</p>
    </div>
  `;

  return card;
}


  showProductModal(product) {
    const modal = document.getElementById("product-modal");
    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalOwner = document.getElementById("modal-owner");
    const modalPrice = document.getElementById("modal-price");

    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalTitle.textContent = product.name;
    modalOwner.textContent = `by ${product.owner}`;
    modalPrice.textContent = `$${product.price.toFixed(2)}`;

    modal.classList.remove("hidden");
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("product-modal");
    modal.classList.remove("show");
    setTimeout(() => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }, 250);
  }

  previousProduct() {
    if (this.currentProductIndex > 0) {
      this.currentProductIndex--;
      this.updateProductCounter();
      this.updateNavigationButtons();
      this.highlightCurrentProduct();
    }
  }

  nextProduct() {
    if (this.currentProductIndex < this.filteredProducts.length - 1) {
      this.currentProductIndex++;
      this.updateProductCounter();
      this.updateNavigationButtons();
      this.highlightCurrentProduct();
    }
  }

  highlightCurrentProduct() {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card, index) => {
      card.classList.remove("highlighted");
    });

    const currentPageStartIndex = (this.currentPage - 1) * this.productsPerPage;
    const cardIndex = this.currentProductIndex - currentPageStartIndex;

    if (cardIndex >= 0 && cardIndex < cards.length) {
      cards[cardIndex].classList.add("highlighted");
      cards[cardIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  updateProductCounter() {
    document.getElementById("current-product").textContent =
      this.currentProductIndex + 1;
    document.getElementById("total-products").textContent =
      this.filteredProducts.length;
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-product");
    const nextBtn = document.getElementById("next-product");

    prevBtn.disabled = this.currentProductIndex === 0;
    nextBtn.disabled =
      this.currentProductIndex === this.filteredProducts.length - 1;
  }

  setView(view) {
    this.currentView = view;

    // Update button states
    document
      .getElementById("grid-view")
      .classList.toggle("active", view === "grid");
    document
      .getElementById("list-view")
      .classList.toggle("active", view === "list");

    // Re-render products with new view
    this.renderProducts();
  }

  getTotalPages() {
    return Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  goToPage(page) {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.renderProducts();
      this.renderPagination();
    }
  }

  renderPagination() {
    const totalPages = this.getTotalPages();
    const pageNumbers = document.getElementById("page-numbers");
    const firstBtn = document.getElementById("first-page");
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    const lastBtn = document.getElementById("last-page");

    // Clear existing page numbers
    pageNumbers.innerHTML = "";

    // Update navigation buttons
    firstBtn.disabled = this.currentPage === 1;
    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage === totalPages;
    lastBtn.disabled = this.currentPage === totalPages;

    // Generate page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `page-number ${
        i === this.currentPage ? "active" : ""
      }`;
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => this.goToPage(i));
      pageNumbers.appendChild(pageBtn);
    }
  }

  addToCart(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.showNotification(`${product.name} added to cart!`, "success");
      this.animateButton(event.target);
    }
  }

  addToWishlist(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.showNotification(`${product.name} added to wishlist!`, "success");
      this.animateButton(event.target);
    }
  }

  animateButton(button) {
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "";
    }, 150);
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <i class="fas fa-${
              type === "success" ? "check-circle" : "info-circle"
            }"></i>
            <span>${message}</span>
        `;

    // Add notification styles if not already present
    if (!document.querySelector(".notification-styles")) {
      const styles = document.createElement("style");
      styles.className = "notification-styles";
      styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 1001;
                    transform: translateX(100%);
                    transition: transform 0.3s ease-in-out;
                }
                .notification-success {
                    border-left: 4px solid var(--success-color);
                    color: var(--success-color);
                }
                .notification-info {
                    border-left: 4px solid var(--primary-color);
                    color: var(--primary-color);
                }
                .notification.show {
                    transform: translateX(0);
                }
            `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add("show"), 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    const container = document.getElementById("products-container");
    container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    Try Again
                </button>
            </div>
        `;

    // Add error styles
    if (!document.querySelector(".error-styles")) {
      const styles = document.createElement("style");
      styles.className = "error-styles";
      styles.textContent = `
                .error-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--gray-500);
                }
                .error-state i {
                    font-size: 3rem;
                    color: var(--error-color);
                    margin-bottom: 1rem;
                }
                .error-state h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: var(--gray-600);
                }
            `;
      document.head.appendChild(styles);
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Additional CSS for highlighted product and animations
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
    .product-card.highlighted {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 25px -5px rgba(102, 126, 234, 0.2), 0 10px 10px -5px rgba(102, 126, 234, 0.1);
        border: 2px solid var(--primary-color);
    }
    
    .product-card.highlighted::before {
        opacity: 0.1;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .loading i {
        animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
    }
    
    .product-card:hover .product-actions {
        transform: translateY(0);
        opacity: 1;
    }
    
    .product-actions {
        transform: translateY(10px);
        opacity: 0.8;
        transition: all var(--transition-normal);
    }
    
    .btn:active {
        transform: translateY(-1px) scale(0.98);
    }
    
    .modal-content {
        animation: modalSlideIn 0.3s ease-out;
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .page-number:hover {
        transform: translateY(-2px);
    }
    
    .filter-input:focus,
    .filter-select:focus {
        transform: translateY(-1px);
    }
`;
document.head.appendChild(additionalStyles);

// Initialize the application
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new ProductListing();
});

// Service Worker for offline functionality (optional enhancement)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
