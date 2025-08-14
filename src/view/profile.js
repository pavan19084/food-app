import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';

export default function Profile({ navigation }) {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    completion: 80,
    rating: 4.85,
    phone: '+91 98765 43210',
    location: 'Hyderabad, India',
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return '#48BB78'; // success
    if (percentage >= 60) return '#ED8936'; // warning
    return '#F56565'; // error
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              <Text style={styles.userLocation}>{user.location}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile', { user })}
              style={styles.editIconButton}
            >
              <Image source={require('../../assets/edit.png')} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          
          {/* Profile Completion */}
          <View style={styles.completionSection}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={[styles.completionPercentage, { color: getCompletionColor(user.completion) }]}>
                {user.completion}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: getCompletionColor(user.completion),
                    width: `${user.completion}%`
                  }
                ]} 
              />
            </View>
            <Text style={styles.completionSubtext}>
              Complete your profile to unlock more features
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <Section title="Account" />
        <Card>
          <Item title="Personal Information" onPress={() => navigation.navigate('EditProfile', { user })} />
          <Divider />
          <Item title="Privacy Settings" onPress={() => {}} />
        </Card>

        {/* Library */}
        <Section title="Library" />
        <Card>
          <Item title="Your Collections" onPress={() => {}} />
          <Divider />
          <Item title="Order History" onPress={() => {}} />
          <Divider />
          <Item title="Saved Addresses" onPress={() => {}} />
        </Card>

        {/* Support & More */}
        <Section title="Support & More" />
        <Card>
          <Item title="Help Center" onPress={() => {}} />
          <Divider />
          <Item title="Send Feedback" onPress={() => {}} />
          <Divider />
          <Item title="About App" onPress={() => {}} />
          <Divider />
          <Item title="Terms & Privacy" onPress={() => {}} />
          <Divider />
          <Item title="Log Out" danger onPress={() => {}} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* ---------- atoms ---------- */

function Section({ title }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionIndicator} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Card({ children }) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

function Item({ title, onPress, right, danger }) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress || undefined}
      style={styles.item}
    >
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: danger ? '#F56565' : '#333' }]}>{title}</Text>
      </View>
      {right || <Text style={[styles.itemArrow, { color: '#999' }]}>›</Text>}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { 
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  
  // Profile Card
  profileCard: {
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    marginRight: 16,
    borderColor: '#E64A19', // Terracotta color
  },
  profileInfo: { 
    flex: 1, 
    justifyContent: 'center',
    marginRight: 16,
  },
  editIconButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E64A19',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  editIcon: {
    width: 24, // Adjust size to fit button
    height: 24, // Adjust size to fit button
    tintColor: '#FFFFFF', // Ensure white color for the image
  },
  userName: { 
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4 
  },
  userEmail: { 
    fontSize: 14,
    color: '#666',
    marginBottom: 2 
  },
  userPhone: { 
    fontSize: 14,
    color: '#666',
    marginBottom: 2 
  },
  userLocation: { 
    fontSize: 14,
    color: '#666' 
  },
  
  // Completion Section
  completionSection: { marginBottom: 20 },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitle: { 
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  completionPercentage: { 
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#E2E8F0',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completionSubtext: { 
    fontSize: 12,
    color: '#666',
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
    backgroundColor: '#FFF5F2', // Light terracotta background
  },
  statValue: { 
    fontSize: 18,
    fontWeight: '800',
    color: '#E64A19', // Terracotta color
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  // Section
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
    backgroundColor: '#E64A19', // Terracotta color
  },
  sectionTitle: { 
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  
  // Item
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemContent: { flex: 1 },
  itemTitle: { 
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemArrow: { 
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  
  // Divider
  divider: {
    height: 1,
    marginLeft: 20,
    backgroundColor: '#E2E8F0',
  },
});
