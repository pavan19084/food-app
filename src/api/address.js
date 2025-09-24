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

// GET /address - Get all addresses for user
export const getAllAddresses = async () => {
  try {
    const { data } = await client.get('/address');
    return data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
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
