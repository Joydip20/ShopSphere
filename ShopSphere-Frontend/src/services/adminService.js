import axiosInstance from "../api/axiosInstance";

export const getAllOrders = async () => {
  const response = await axiosInstance.get("/admin/orders");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.put(
    `/admin/orders/${orderId}/status`,
    null,
    {
      params: {
        status,
      },
    },
  );

  return response.data;
};
