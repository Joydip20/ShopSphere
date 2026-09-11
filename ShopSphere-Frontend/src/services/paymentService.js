import axiosInstance from "../api/axiosInstance";

export const createPaymentOrder = async (orderId) => {
  const response = await axiosInstance.post(`/payments/create/${orderId}`);

  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post("/payments/verify", paymentData);

  return response.data;
};
