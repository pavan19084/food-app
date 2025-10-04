import client from './client';
import { Restaurant, RestaurantMenu } from '../models/restaurant';

// Get all restaurants
export const getAllRestaurants = async () => {
  try {
    const response = await client.get('/restaurant/getAllRestaurant');
    
    if (response.data && response.data.data) {
      // Filter only active restaurants and convert to Restaurant objects
      const activeRestaurants = response.data.data
        .filter(restaurantData => restaurantData.status === 'active')
        .map(restaurantData => new Restaurant(restaurantData));
      
      return {
        success: true,
        data: activeRestaurants,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      data: [],
      message: 'No restaurants found'
    };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch restaurants'
    };
  }
};

// Get restaurant menu by restaurant ID
export const getRestaurantMenu = async (restaurantId) => {
  try {
    const response = await client.get(`/restaurant/menu/${restaurantId}`);
    
    if (response.data) {
      const menu = new RestaurantMenu(response.data);
      return {
        success: true,
        data: menu,
        message: 'Menu fetched successfully'
      };
    }
    
    return {
      success: false,
      data: null,
      message: 'No menu found'
    };
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch menu'
    };
  }
};
