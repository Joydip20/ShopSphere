/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders();
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    const statusUpper = status?.toUpperCase() || "PENDING";

    switch (statusUpper) {
      case "COMPLETED":
      case "DELIVERED":
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "SHIPPED":
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
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
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-64 animate-pulse rounded-lg bg-slate-200" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                </div>
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
              </div>
            ))}
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
  if (error) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            Unable to load orders
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <button
            onClick={loadOrders}
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
   * MAIN ORDERS VIEW
   * ============================
   */
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">
              Account
            </span>
            <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
              My Orders
            </h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
              📦
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              When you place orders, they will show up here for tracking and
              details.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Start Shopping
              <span>→</span>
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md"
              >
                {/* Top Row: Order ID & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Order ID
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        #{order.orderId}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${getStatusBadge(
                      order.status,
                    )}`}
                  >
                    {order.status || "PENDING"}
                  </span>
                </div>

                <div className="my-5 border-t border-slate-100" />

                {/* Middle Row: Items preview & Total */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Items Thumbnails or Count */}
                  <div className="flex items-center gap-3">
                    {order.items && order.items.length > 0 ? (
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="inline-block h-10 w-10 rounded-xl border-2 border-white bg-slate-100 overflow-hidden shadow-sm shrink-0"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName || "Product"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs">
                                📦
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="text-xs font-bold text-slate-600">
                      <span>
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1 ? "Item" : "Items"}
                      </span>
                    </div>
                  </div>

                  {/* Order Total Amount */}
                  <div className="sm:text-right">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Total Amount
                    </span>
                    <p className="text-xl font-black text-blue-600">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-5 pt-4 border-t border-slate-50">
                  <Link
                    to={`/orders/${order.orderId}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    View Order Details
                    <span className="text-sm">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
