import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Profile({ navigation }) {
  const { user, signOut } = useAuth();

  // Safely map fields (AuthContext user has: id, username, email, phone)
  const ratingNum = Number(user?.rating ?? 0);
  const completionNum = Number(user?.completion ?? (user ? 60 : 30)); // arbitrary default
  const avatarUri = user?.avatar || 'https://i.pravatar.cc/150?img=12';

  const safeUser = {
    name: user?.name || user?.username || 'Guest',
    email: user?.email || 'guest@example.com',
    phone: user?.phone || '',
    avatar: avatarUri,
    rating: ratingNum,
    completion: completionNum,
    isLoggedIn: !!user,
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return '#48BB78'; // success
    if (percentage >= 60) return '#ED8936'; // warning
    return '#F56565'; // error
  };

  const handleEdit = () => {
    navigation.navigate('EditProfile', { user: {
      name: safeUser.name,
      email: safeUser.email,
      phone: safeUser.phone,
      dob: '',
      gender: '',
      avatar: safeUser.avatar,
    }});
  };

  const handleLogin = () => navigation.navigate('Login', { next: 'Profile' });
  const handleSignUp = () => navigation.navigate('SignUp', { next: 'Profile' });

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
            <Image source={{ uri: safeUser.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{safeUser.name}</Text>
              <Text style={styles.userEmail}>{safeUser.email}</Text>
              {!!safeUser.phone && <Text style={styles.userPhone}>{safeUser.phone}</Text>}
            </View>

            {safeUser.isLoggedIn ? (
              <TouchableOpacity onPress={handleEdit} style={styles.editIconButton}>
                <Image source={require('../../assets/edit.png')} style={styles.editIcon} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {/* Profile Completion */}
          <View style={styles.completionSection}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={[styles.completionPercentage, { color: getCompletionColor(safeUser.completion) }]}>
                {Number.isFinite(safeUser.completion) ? `${safeUser.completion}%` : '—'}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: getCompletionColor(safeUser.completion),
                    width: `${Math.min(Math.max(safeUser.completion, 0), 100)}%`
                  }
                ]} 
              />
            </View>
            <Text style={styles.completionSubtext}>
              {safeUser.isLoggedIn
                ? 'Complete your profile to unlock more features'
                : 'Log in to personalize your experience'}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Number.isFinite(safeUser.rating) ? safeUser.rating.toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{safeUser.isLoggedIn ? '12' : '0'}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{safeUser.isLoggedIn ? '5' : '0'}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        </View>

        {/* If guest: show quick actions */}
        {!safeUser.isLoggedIn ? (
          <>
            <Section title="Welcome" />
            <Card>
              <Item title="Sign In" onPress={handleLogin} />
              <Divider />
              <Item title="Create an Account" onPress={handleSignUp} />
            </Card>
          </>
        ) : (
          <>
            {/* Account */}
            <Section title="Account" />
            <Card>
              <Item title="Personal Information" onPress={handleEdit} />
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
              <Item title="Saved Addresses" onPress={() => navigation.navigate('SavedAddresses')} />
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
              <Item title="Log Out" danger onPress={signOut} />
            </Card>
          </>
        )}
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
  return <View style={styles.card}>{children}</View>;
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
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, marginRight: 16, borderColor: '#E64A19',
  },
  profileInfo: { flex: 1, justifyContent: 'center', marginRight: 16 },
  editIconButton: {
    position: 'absolute', top: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E64A19',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  editIcon: { width: 24, height: 24, tintColor: '#FFFFFF' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#666', marginBottom: 2 },
  userPhone: { fontSize: 14, color: '#666', marginBottom: 2 },
  
  // Completion Section
  completionSection: { marginBottom: 20 },
  completionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  completionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  completionPercentage: { fontSize: 18, fontWeight: 'bold' },
  progressBar: { height: 8, borderRadius: 4, marginBottom: 8, backgroundColor: '#E2E8F0' },
  progressFill: { height: '100%', borderRadius: 4 },
  completionSubtext: { fontSize: 12, color: '#666' },
  
  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, minWidth: 60, backgroundColor: '#FFF5F2' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#E64A19', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#666' },
  
  // Section
  section: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionIndicator: { width: 4, height: 20, borderRadius: 2, marginRight: 12, backgroundColor: '#E64A19' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  
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
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
  itemArrow: { fontSize: 18, fontWeight: '600', color: '#999' },
  
  // Divider
  divider: { height: 1, marginLeft: 20, backgroundColor: '#E2E8F0' },
});
