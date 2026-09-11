/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [addingProductId, setAddingProductId] = useState(null);

  const [cartMessage, setCartMessage] = useState("");

  const [cartMessageType, setCartMessageType] = useState("success");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [category, setCategory] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(8);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [sortBy, setSortBy] = useState("id");
  const [direction, setDirection] = useState("asc");

  /*
   * ============================
   * READ SEARCH FROM URL
   * ============================
   */

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";

    setSearch(urlSearch);
    setPage(0);
  }, [searchParams]);

  /*
   * ============================
   * LOAD PRODUCTS
   * ============================
   */

  useEffect(() => {
    loadProducts();
  }, [page, size, sortBy, direction, category, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts({
        page,
        size,
        sortBy,
        direction,
        keyword: search,
        category,
      });

      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================
   * ADD TO CART
   * ============================
   */

  const handleAddToCart = async (productId) => {
    // Guest user
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setAddingProductId(productId);
      setCartMessage("");

      await addToCart(productId, 1);

      setCartMessageType("success");

      setCartMessage("Product added to cart successfully!");

      setTimeout(() => {
        setCartMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);

      setCartMessageType("error");

      setCartMessage(
        error.response?.data?.message || "Unable to add product to cart",
      );

      setTimeout(() => {
        setCartMessage("");
      }, 3000);
    } finally {
      setAddingProductId(null);
    }
  };

  /*
   * ============================
   * SEARCH
   * ============================
   */

  const handleSearch = () => {
    const trimmedSearch = search.trim();

    setPage(0);

    if (trimmedSearch) {
      setSearchParams({
        search: trimmedSearch,
      });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /*
   * ============================
   * CATEGORY
   * ============================
   */

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(0);
  };

  /*
   * ============================
   * SORTING
   * ============================
   */

  const handleSortChange = (event) => {
    const [newSortBy, newDirection] = event.target.value.split("-");

    setSortBy(newSortBy);
    setDirection(newDirection);
    setPage(0);
  };

  /*
   * ============================
   * PAGE SIZE
   * ============================
   */

  const handlePageSizeChange = (event) => {
    setSize(Number(event.target.value));
    setPage(0);
  };

  /*
   * ============================
   * ERROR STATE
   * ============================
   */

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <button
            onClick={loadProducts}
            className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * MAIN PAGE
   * ============================
   */

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50">
      {/* =========================================
          TOAST NOTIFICATION
      ========================================= */}

      {cartMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-2xl transition-all duration-300 animate-bounce">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
              cartMessageType === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {cartMessageType === "success" ? "✓" : "!"}
          </span>

          <p className="text-sm font-medium">{cartMessage}</p>
        </div>
      )}

      {/* =========================================
          HERO SECTION
      ========================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Hero Content */}

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                <span className="h-2 w-2 animate-ping rounded-full bg-blue-600" />
                Welcome to ShopSphere
              </div>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Shop smarter.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Live better.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                Discover curated quality products, transparent pricing, and
                instant checkout delivery.
              </p>

              <button
                onClick={() =>
                  document.getElementById("products-section")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30"
              >
                Explore Products
                <span>→</span>
              </button>
            </div>

            {/* Hero Visual */}

            <div className="hidden justify-end lg:flex">
              <div className="relative h-72 w-72">
                <div className="absolute inset-0 rotate-6 rounded-3xl bg-blue-100/70" />

                <div className="relative flex h-full w-full items-center justify-center rounded-3xl bg-blue-600 shadow-2xl shadow-blue-500/30">
                  <div className="text-center text-white">
                    <span className="text-6xl">🛍️</span>

                    <p className="mt-4 text-xl font-bold">Quality Guaranteed</p>

                    <p className="mt-1 text-xs text-blue-100">
                      Handpicked items for you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PRODUCTS SECTION
      ========================================= */}

      <section
        id="products-section"
        className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8"
      >
        {/* Section Heading */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              Our Collection
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Explore Products
            </h2>
          </div>

          <div className="self-start rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm sm:self-auto">
            {totalElements} items available
          </div>
        </div>

        {/* =========================================
            FILTER BAR
        ========================================= */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-12">
            {/* Search */}

            <div className="relative md:col-span-5">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Search Button */}

            <button
              onClick={handleSearch}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600 md:col-span-2"
            >
              Search
            </button>

            {/* Category */}

            <select
              value={category}
              onChange={handleCategoryChange}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 md:col-span-2"
            >
              <option value="">All Categories</option>

              <option value="Electronics">Electronics</option>

              <option value="Clothing">Clothing</option>

              <option value="Books">Books</option>
            </select>

            {/* Sorting */}

            <select
              value={`${sortBy}-${direction}`}
              onChange={handleSortChange}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 md:col-span-3"
            >
              <option value="id-asc">Default Sorting</option>

              <option value="price-asc">Price: Low to High</option>

              <option value="price-desc">Price: High to Low</option>

              <option value="name-asc">Name: A → Z</option>

              <option value="name-desc">Name: Z → A</option>
            </select>
          </div>
        </div>

        {/* =========================================
            RESULTS INFO
        ========================================= */}

        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-slate-500 sm:text-sm">
            Showing{" "}
            <span className="font-bold text-slate-900">{products.length}</span>{" "}
            of <span className="font-bold text-slate-900">{totalElements}</span>{" "}
            items
          </p>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Per page
            </label>

            <select
              value={size}
              onChange={handlePageSizeChange}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* =========================================
            LOADING SKELETON
        ========================================= */}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: size,
            }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="h-48 w-full rounded-xl bg-slate-200" />

                <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />

                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />

                <div className="mt-6 flex items-center justify-between">
                  <div className="h-6 w-1/3 rounded bg-slate-200" />

                  <div className="h-9 w-24 rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          /* =========================================
             PRODUCT GRID
          ========================================= */

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div>
                  {/* Product Image */}

                  <Link
                    to={`/products/${product.id}`}
                    className="relative block h-52 overflow-hidden bg-slate-100"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        📦
                      </div>
                    )}

                    {/* Category */}

                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 shadow-sm backdrop-blur-sm">
                      {product.category}
                    </span>

                    {/* Sold Out */}

                    {product.stock === 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        Sold Out
                      </span>
                    )}
                  </Link>

                  {/* Product Details */}

                  <div className="p-5">
                    <Link
                      to={`/products/${product.id}`}
                      className="line-clamp-1 text-base font-bold text-slate-900 transition hover:text-blue-600"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-1 h-10 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Price
                        </span>

                        <p className="text-xl font-extrabold text-slate-900">
                          ₹{Number(product.price).toFixed(2)}
                        </p>
                      </div>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          product.stock > 0
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-red-200 bg-red-50 text-red-600"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add To Cart */}

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={
                      product.stock === 0 || addingProductId === product.id
                    }
                    className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition duration-200 hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100"
                  >
                    {addingProductId === product.id
                      ? "Adding..."
                      : product.stock === 0
                        ? "Out of Stock"
                        : user
                          ? "Add to Cart"
                          : "Sign in to Add"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* =========================================
             EMPTY STATE
          ========================================= */

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🔍
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No products found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              We couldn't find anything matching your filters.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("");
                setPage(0);
                setSearchParams({});
              }}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* =========================================
            PAGINATION
        ========================================= */}

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {/* Previous */}

            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>

            {/* Page Numbers */}

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index,
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                  page === pageNumber
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {pageNumber + 1}
              </button>
            ))}

            {/* Next */}

            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-base font-bold text-slate-900">ShopSphere</p>

            <p className="text-xs text-slate-400">
              Your modern shopping destination.
            </p>
          </div>

          <p className="mt-4 text-xs text-slate-400 sm:mt-0">
            Powered by React & Spring Boot
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Products;
