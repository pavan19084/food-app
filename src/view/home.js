import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { colors } from '../constants/colors';

const Home = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>92 eats</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitle}>What would you like to eat today?</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🍕 Pizza</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🍔 Burgers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🍜 Asian</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🥗 Healthy</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Restaurants</Text>
          <View style={styles.restaurantCard}>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Pizza Palace</Text>
              <Text style={styles.restaurantCuisine}>Italian • Pizza</Text>
              <Text style={styles.restaurantRating}>⭐ 4.8 (2.1k reviews)</Text>
              <Text style={styles.deliveryInfo}>🕒 25-35 min • 🚚 $2.99 delivery</Text>
            </View>
          </View>
          
          <View style={styles.restaurantCard}>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Burger House</Text>
              <Text style={styles.restaurantCuisine}>American • Burgers</Text>
              <Text style={styles.restaurantRating}>⭐ 4.6 (1.8k reviews)</Text>
              <Text style={styles.deliveryInfo}>🕒 20-30 min • 🚚 $1.99 delivery</Text>
            </View>
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: colors.primary,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 8,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textWhite,
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginTop: -16,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  restaurantCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  restaurantRating: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  deliveryInfo: {
    fontSize: 14,
    color: colors.textLight,
  },
  offerCard: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 16,
    color: colors.textWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
  },
  offerCode: {
    fontSize: 14,
    color: colors.textWhite,
    opacity: 0.8,
    fontWeight: '600',
  },
});

export default Home;
