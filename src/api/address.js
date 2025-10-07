import client from './client';

// POST /address - Add new address
export const addAddress = async (addressData) => {
  try {
    const { data } = await client.post('/address', addressData);
    return data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// PATCH /address/:id - Update existing address
export const updateAddress = async (addressId, addressData) => {
  try {
    const { data } = await client.patch(`/address/${addressId}`, addressData);
    return data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// GET /my-addresses - Get all addresses for user
export const getAllAddresses = async () => {
  
  try {
    const { data } = await client.get('/my-addresses');
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch addresses'
    };
  }
};

// DELETE /address/:id - Delete address
export const deleteAddress = async (addressId) => {
  try {
    const { data } = await client.delete(`/address/${addressId}`);
    return data;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};
