// colors.js
export const colors = {
  // Trove Brand Colors (from guidelines)
  primary: '#E64A19', // Deep Terracotta
  secondary: '#FF5722', // Deep Orange
  accent: '#FF7043', // Light Orange for accents

  // Light Mode Colors
  lightMode: {
    background: '#FFF8F5', 
    surface: '#FFFFFF', 
    text: '#1A202C', // Dark text for readability
    textLight: '#4A5568', // Lighter text for secondary content
    textWhite: '#FFFFFF', // Pure white text

    // Button colors
    buttonPrimary: '#E64A19', // Same primary color for buttons
    buttonSecondary: '#FF5722', // Deep orange for secondary buttons
    buttonText: '#FFFFFF', // White text for buttons

    // Status colors
    success: '#48BB78',
    error: '#F56565',
    warning: '#ED8936',

    // UI elements
    border: '#E2E8F0',
    overlay: 'rgba(0, 0, 0, 0.3)', // Soft overlay for modals/menus
  },

  // Dark Mode Colors
  darkMode: {
    background: '#121212', // Dark background to reduce strain
    surface: '#1C1C1E', // Dark surface for cards
    text: '#F7FAFC', // Light text for readability against dark bg
    textLight: '#A0AEC0', // Slightly muted light text
    textWhite: '#FFFFFF', // White text for high contrast

    // Button colors
    buttonPrimary: '#FF7043', // Slightly lighter primary button for contrast
    buttonSecondary: '#FF5722', // Slightly muted secondary button
    buttonText: '#FFFFFF', // White button text

    // Status colors
    success: '#48BB78', // Green stays the same
    error: '#F56565', // Red stays the same
    warning: '#ED8936', // Orange stays the same

    // UI elements
    border: '#2D3748', // Muted border to blend with dark theme
    shadow: 'rgba(0, 0, 0, 0.5)', // Stronger shadow for depth in dark mode
    overlay: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast in modals/menus
  },

  // Additional adjustments for dark mode aesthetics
  darkAdjustedColors: {
    primary: '#FF7043', // Slightly lighter and more vibrant in dark mode
    secondary: '#FF5722', // Adjusted deep orange
    accent: '#FF7043', // Light orange for accents
  },
};
