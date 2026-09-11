import axiosInstance from "../api/axiosInstance";

export const getProducts = async ({
  page = 0,
  size = 8,
  sortBy = "id",
  direction = "asc",
  keyword = "",
  category = "",
} = {}) => {
  const response = await axiosInstance.get("/products", {
    params: {
      page,
      size,
      sortBy,
      direction,
      keyword: keyword || undefined,
      category: category || undefined,
    },
  });

  return response.data;
};

// Get single product by ID
export const getProductById = async (productId) => {
  const response = await axiosInstance.get(`/products/${productId}`);

  return response.data;
};
