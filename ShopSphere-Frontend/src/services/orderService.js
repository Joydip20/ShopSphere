import axiosInstance from "../api/axiosInstance";

export const createOrder = async () => {
  const response = await axiosInstance.post("/orders");

  return response.data;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get("/orders");

  return response.data;
};

export const getMyOrder = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);

  return response.data;
};
