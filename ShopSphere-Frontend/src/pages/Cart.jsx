/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/cartService";

import { createOrder } from "../services/orderService";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCart();
      setCart(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setCreatingOrder(true);
      setCheckoutError("");

      const response = await createOrder();
      const order = response.data;

      navigate(`/orders/${order.orderId}`);
    } catch (err) {
      console.error(err);
      setCheckoutError(err.response?.data?.message || "Unable to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleQuantityChange = async (cartItemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      setUpdatingItemId(cartItemId);
      const response = await updateCartItem(cartItemId, newQuantity);
      setCart(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      setUpdatingItemId(cartItemId);
      const response = await removeCartItem(cartItemId);
      setCart(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  /*
   * ============================
   * LOADING STATE (Skeleton)
   * ============================
   */
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 py-10 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-64 animate-pulse rounded-lg bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row"
                >
                  <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-200 sm:w-32" />
                  <div className="flex-1 space-y-4">
                    <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-1/4 animate-pulse rounded bg-slate-100" />
                    <div className="flex items-center justify-between pt-4">
                      <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
                      <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-slate-200" />
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
  if (error && !cart) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            Unable to load cart
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <button
            onClick={loadCart}
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
   * EMPTY CART
   * ============================
   */
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
            🛒
          </div>

          <h2 className="mt-6 text-2xl font-black text-slate-900">
            Your cart is empty
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Looks like you haven't added any products to your cart yet.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30"
          >
            Explore Products
            <span>→</span>
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * MAIN CART VIEW
   * ============================
   */
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">
              Checkout Process
            </span>
            <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
              Shopping Cart
            </h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            {cart.items.reduce((sum, item) => sum + item.quantity, 0)} total
            items in cart
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-3">
              <span className="text-base">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-xs font-bold uppercase text-red-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items List */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div
                key={item.cartItemId}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {/* Image */}
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:w-32">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between self-stretch">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {item.productName}
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Unit Price: ₹{Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleRemove(item.cartItemId)}
                        disabled={updatingItemId === item.cartItemId}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                        title="Remove item"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      {/* Quantity Selector */}
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.cartItemId,
                              item.quantity,
                              -1,
                            )
                          }
                          disabled={
                            item.quantity === 1 ||
                            updatingItemId === item.cartItemId
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="w-10 text-center text-xs font-bold text-slate-900">
                          {updatingItemId === item.cartItemId ? (
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.cartItemId,
                              item.quantity,
                              1,
                            )
                          }
                          disabled={updatingItemId === item.cartItemId}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          Subtotal
                        </span>
                        <p className="text-lg font-black text-slate-900">
                          ₹{Number(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-slate-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-6 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Total Items</span>
                  <span className="font-bold text-slate-900">
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(cart.totalAmount).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
              </div>

              <div className="my-6 border-t border-slate-100" />

              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">
                  Grand Total
                </span>
                <span className="text-2xl font-black text-blue-600">
                  ₹{Number(cart.totalAmount).toFixed(2)}
                </span>
              </div>

              {checkoutError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
                  {checkoutError}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={creatingOrder}
                className="mt-6 w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition duration-200 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                {creatingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating Order...
                  </span>
                ) : (
                  "Proceed to Checkout →"
                )}
              </button>

              <Link
                to="/products"
                className="mt-4 block text-center text-xs font-bold text-slate-500 hover:text-blue-600 transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
