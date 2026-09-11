/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getMyOrder } from "../services/orderService";
import { createPaymentOrder, verifyPayment } from "../services/paymentService";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrder(orderId);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentMessage("");
      setError("");

      // 1. Create Razorpay order from backend
      const response = await createPaymentOrder(orderId);
      const paymentOrder = response.data;

      // 2. Check Razorpay script
      if (!window.Razorpay) {
        setError("Razorpay Checkout failed to load. Please refresh the page.");
        setPaymentLoading(false);
        return;
      }

      // 3. Configure Razorpay Checkout
      const options = {
        key: paymentOrder.keyId,
        amount: Math.round(Number(paymentOrder.amount) * 100),
        currency: paymentOrder.currency,
        name: "ShopSphere",
        description: `Payment for Order #${orderId}`,
        order_id: paymentOrder.razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            // 4. Send Razorpay response to backend for verification
            await verifyPayment({
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
            });

            setPaymentMessage("Payment successful! Order confirmed.");
            // 5. Reload order from backend
            await loadOrder();
          } catch (err) {
            setError(
              err.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            setPaymentMessage("Payment window closed.");
          },
        },
        theme: {
          color: "#2563eb",
        },
      };

      // 6. Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to start payment");
      setPaymentLoading(false);
    }
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    const statusUpper = status?.toUpperCase() || "PENDING";
    switch (statusUpper) {
      case "CONFIRMED":
      case "DELIVERED":
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELLED":
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
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
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
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
  if (error && !order) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            Unable to load order
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <Link
            to="/orders"
            className="mt-7 inline-block w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * MAIN ORDER DETAILS VIEW
   * ============================
   */
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
          >
            <span>←</span> Back to All Orders
          </Link>
        </div>

        {/* Header Summary */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">
              Order Details
            </span>
            <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
              Order #{order.orderId}
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <span
            className={`inline-flex items-center self-start sm:self-center rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider ${getStatusBadge(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* Banners & Messages */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-3">
              <span>⚠️</span>
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

        {paymentMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-center gap-3">
              <span>✓</span>
              <p className="text-sm font-medium">{paymentMessage}</p>
            </div>
            <button
              onClick={() => setPaymentMessage("")}
              className="text-xs font-bold uppercase text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Order Items Section */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">
              Items Summary
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div
                key={item.orderItemId}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Item Image Thumbnail */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl">
                        📦
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      ₹{Number(item.price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 sm:hidden">
                    Subtotal:{" "}
                  </span>
                  <p className="text-base font-black text-slate-900">
                    ₹{Number(item.subtotal).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-5">
            <span className="text-base font-bold text-slate-900">
              Total Amount
            </span>
            <span className="text-2xl font-black text-blue-600">
              ₹{Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Actions */}
        {order.status === "PENDING" && (
          <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Complete Payment
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Your order has been reserved. Complete payment to confirm
                  fulfillment.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 bg-blue-100/60 px-3 py-1.5 rounded-full shrink-0">
                🔒 Secure Razorpay Checkout
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="mt-6 w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition duration-200 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {paymentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Processing Payment...
                </span>
              ) : (
                `Pay ₹${Number(order.totalAmount).toFixed(2)} Now`
              )}
            </button>
          </div>
        )}

        {(order.status === "CONFIRMED" || order.status === "DELIVERED") && (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-black text-emerald-900">
                  Payment Confirmed & Verified
                </h2>
                <p className="mt-0.5 text-xs font-medium text-emerald-700">
                  Your payment was successfully processed. We are preparing your
                  items for delivery.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
