/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import { addToCart } from "../services/cartService";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState("success");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProductById(productId);
      setProduct(response);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Number(value);
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      setCartMessage("");

      await addToCart(product.id, quantity);

      setCartMessageType("success");
      setCartMessage(`Added ${quantity} item(s) to your cart!`);

      setTimeout(() => {
        setCartMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setCartMessageType("error");
      setCartMessage(
        err.response?.data?.message || "Unable to add product to cart",
      );

      setTimeout(() => {
        setCartMessage("");
      }, 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  /*
   * ============================
   * LOADING STATE
   * ============================
   */
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 py-10 px-5 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
            <div className="h-[450px] animate-pulse bg-slate-200" />
            <div className="p-8 sm:p-10 space-y-6">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * ERROR STATE
   * ============================
   */
  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            {error || "Product Not Found"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The product you are looking for might have been removed or is
            temporarily unavailable.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * MAIN DETAILS PAGE
   * ============================
   */
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50">
      {/* Toast Notification */}
      {cartMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-5 py-4 shadow-2xl transition-all duration-300 animate-bounce">
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

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={() => navigate("/products")}
            className="hover:text-blue-600 transition"
          >
            Products
          </button>
          <span>/</span>
          <span className="text-slate-400">{product.category}</span>
          <span>/</span>
          <span className="truncate text-slate-900">{product.name}</span>
        </nav>

        {/* Product Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative flex min-h-[380px] items-center justify-center bg-slate-100 p-8 md:min-h-[500px]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-[420px] w-full object-contain transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <span className="text-6xl">📦</span>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider">
                    No image available
                  </p>
                </div>
              )}

              <span className="absolute left-5 top-5 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-600 shadow-sm border border-slate-200">
                {product.category}
              </span>
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-between p-8 sm:p-10">
              <div>
                {/* Title */}
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl leading-tight">
                  {product.name}
                </h1>

                {/* Price & Stock Badge */}
                <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      Price
                    </span>
                    <p className="text-3xl font-extrabold text-slate-900">
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                      product.stock > 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} In Stock`
                      : "Out of Stock"}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Product Description
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {product.description}
                  </p>
                </div>

                {/* Quantity Controls */}
                {product.stock > 0 && (
                  <div className="mt-6">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Select Quantity
                    </label>

                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                      >
                        −
                      </button>

                      <span className="w-12 text-center text-sm font-bold text-slate-900">
                        {quantity}
                      </span>

                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Trust Badges */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition duration-200 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100"
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </span>
                  ) : product.stock === 0 ? (
                    "Currently Out of Stock"
                  ) : (
                    `Add ${quantity} Item${quantity > 1 ? "s" : ""} to Cart`
                  )}
                </button>

                <Link
                  to="/products"
                  className="block text-center text-xs font-bold text-slate-500 hover:text-blue-600 transition"
                >
                  ← Continue Shopping
                </Link>

                {/* Micro Guarantee Badges */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-6 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center gap-1">
                    <span>🚚 Express Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span>🔒 Secure Checkout</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span>✨ Genuine Product</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
