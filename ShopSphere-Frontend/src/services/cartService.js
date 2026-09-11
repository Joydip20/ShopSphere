import axiosInstance from "../api/axiosInstance";

export const addToCart = async (productId, quantity = 1) => {
  const response = await axiosInstance.post("/cart/items", {
    productId,
    quantity,
  });

  return response.data;
};

export const getCart = async () => {
  const response = await axiosInstance.get("/cart");

  return response.data;
};

export const updateCartItem = async (cartItemId, quantity) => {
  const response = await axiosInstance.put(`/cart/items/${cartItemId}`, null, {
    params: {
      quantity,
    },
  });

  return response.data;
};

export const removeCartItem = async (cartItemId) => {
  const response = await axiosInstance.delete(`/cart/items/${cartItemId}`);

  return response.data;
};
