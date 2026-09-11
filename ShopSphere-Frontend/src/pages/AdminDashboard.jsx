/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/adminProductService";
import { getProducts } from "../services/productService";
import { getAllOrders, updateOrderStatus } from "../services/adminService";

function AdminDashboard() {
  // =========================
  // Orders
  // =========================
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // =========================
  // Products
  // =========================
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const [editingProductId, setEditingProductId] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });

  // =========================
  // Load Orders
  // =========================
  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      setOrderError("");

      const response = await getAllOrders();
      setOrders(response.data || []);
    } catch (err) {
      setOrderError(err.response?.data?.message || "Unable to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // =========================
  // Load Products
  // =========================
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductError("");

      const response = await getProducts({
        page: 0,
        size: 100,
        sortBy: "id",
        direction: "desc",
      });

      setProducts(response.data?.content || []);
    } catch (err) {
      setProductError(err.response?.data?.message || "Unable to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, [loadOrders, loadProducts]);

  // =========================
  // Product Form
  // =========================
  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProductForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      imageUrl: "",
    });
    setEditingProductId(null);
  };

  // =========================
  // Add / Update Product
  // =========================
  const handleProductSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmittingProduct(true);
      setProductError("");

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category: productForm.category,
        imageUrl: productForm.imageUrl,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, productData);
      } else {
        await createProduct(productData);
      }

      resetProductForm();
      await loadProducts();
    } catch (err) {
      setProductError(err.response?.data?.message || "Unable to save product");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // =========================
  // Edit Product
  // =========================
  const handleEditProduct = (product) => {
    setEditingProductId(product.id);

    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // Delete Product
  // =========================
  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setProductError("");
      await deleteProduct(productId);
      await loadProducts();
    } catch (err) {
      setProductError(
        err.response?.data?.message || "Unable to delete product",
      );
    }
  };

  // =========================
  // Update Order Status
  // =========================
  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      setOrderError("");

      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err) {
      setOrderError(
        err.response?.data?.message || "Unable to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Manage your store's inventory, view statistics, and fulfill customer
            orders
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Total Orders
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Pending Orders
            </p>
            <p className="mt-2 text-3xl font-black text-amber-900">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              Delivered Orders
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-900">
              {deliveredOrders}
            </p>
          </div>
        </div>

        {/* Product Form Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </h2>

            {editingProductId && (
              <button
                onClick={resetProductForm}
                className="text-xs font-extrabold text-slate-500 hover:text-slate-800 transition"
              >
                Cancel Editing
              </button>
            )}
          </div>

          {productError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
              ⚠️ {productError}
            </div>
          )}

          <form
            onSubmit={handleProductSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                required
                placeholder="e.g. Wireless Headphones"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={productForm.category}
                onChange={handleProductChange}
                required
                placeholder="e.g. Electronics"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleProductChange}
                required
                min="0"
                step="0.01"
                placeholder="99.99"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={productForm.stock}
                onChange={handleProductChange}
                required
                min="0"
                placeholder="50"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                name="imageUrl"
                value={productForm.imageUrl}
                onChange={handleProductChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleProductChange}
                required
                rows="3"
                placeholder="Write a clear summary of the product..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submittingProduct}
                className="rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition duration-200 hover:bg-blue-700 active:scale-95 disabled:bg-slate-300"
              >
                {submittingProduct
                  ? "Saving Product..."
                  : editingProductId
                    ? "Update Product →"
                    : "Add Product →"}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Form
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Manage Products */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Manage Products
          </h2>

          {loadingProducts ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 py-6">
              <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              Loading product inventory...
            </div>
          ) : products.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 py-4">
              No products found in store.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-4 px-3 font-bold text-slate-400">
                        #{product.id}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-9 w-9 rounded-xl object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs">
                              🛍️
                            </div>
                          )}
                          <span className="font-extrabold text-slate-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-500">
                        {product.category}
                      </td>
                      <td className="py-4 px-3 font-black text-slate-900">
                        ₹{Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-600">
                        {product.stock}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-extrabold text-amber-700 hover:bg-amber-100 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-extrabold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manage Orders */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Manage Orders
          </h2>

          {orderError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
              ⚠️ {orderError}
            </div>
          )}

          {loadingOrders ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 py-6">
              <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              Loading customer orders...
            </div>
          ) : orders.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 py-4">
              No order records available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-4 px-3 font-bold text-slate-900">
                        #{order.orderId}
                      </td>
                      <td className="py-4 px-3 font-black text-slate-900">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-4 px-3 text-xs font-semibold text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-3">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.orderId}
                          onChange={(e) =>
                            handleStatusChange(order.orderId, e.target.value)
                          }
                          className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold outline-none transition focus:ring-2 focus:ring-blue-600/20 ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
