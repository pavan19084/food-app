import client from './client';

// Add new order
export const addOrder = async (orderData) => {
  console.log("orderdata ",orderData);
  try {
    const { data } = await client.post('/user/order/add', orderData);
    console.log(data);
    return {
      success: true,
      data: data,
      message: data.message || 'Order placed successfully'
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to place order'
    };
  }
};

// Track specific order by order ID
export const trackOrder = async (orderId) => {
  try {
    const { data } = await client.get(`/user/order/${orderId}`);

    return {
      success: true,
      data: data,
      message: 'Order details fetched successfully'
    };
  } catch (error) {
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch order details'
    };
  }
};

// Get all orders for a user
export const getUserOrders = async (userId) => {

  
  try {
    const { data } = await client.get(`/user/order/user/${userId}`);

    
    return {
      success: true,
      data: data,
      message: 'User orders fetched successfully'
    };
  } catch (error) {

    
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch user orders'
    };
  }
};
