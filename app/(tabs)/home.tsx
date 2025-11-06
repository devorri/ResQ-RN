import { CATEGORY_CONFIG } from '@/constants/category';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { MOCK_STATIONS } from '@/mocks/data';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { incidents } = useIncidents();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'open' | 'progress' | 'resolved'>('open');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCardPress = (category: 'police' | 'ambulance' | 'fire') => {
    router.push(`/report?category=${category}`);
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  // For station users (police, ambulance, firefighter) - NEW YELLOW DASHBOARD
  if (user?.role === 'police_station' || user?.role === 'ambulance' || user?.role === 'fire_station') {
    const userIncidents = incidents;
    
    // FIXED: Correct status counts
    const openTickets = userIncidents.filter((i) => i.status === 'pending' || i.status === 'accepted').length;
    const inProgress = userIncidents.filter((i) => i.status === 'in_progress').length;
    const resolved = userIncidents.filter((i) => i.status === 'completed').length;

    // FIXED: Filter incidents based on active tab with correct logic
    const filteredIncidents = userIncidents.filter((incident) => {
      switch (activeTab) {
        case 'open':
          return incident.status === 'pending' || incident.status === 'accepted';
        case 'progress':
          return incident.status === 'in_progress';
        case 'resolved':
          return incident.status === 'completed';
        default:
          return incident.status === 'pending' || incident.status === 'accepted';
      }
    });

    const getTabTitle = () => {
      switch (activeTab) {
        case 'open': return 'Open Tickets';
        case 'progress': return 'In Progress';
        case 'resolved': return 'Resolved';
        default: return 'Open Tickets';
      }
    };

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFBF0', '#FFD700']}
          locations={[0, 0.6, 1]}
          style={styles.gradient}
        >
          <ScrollView
            style={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Header */}
            <View style={styles.dashboardHeader}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.dashboardTitle}>Welcome, {getRoleTitle(user.role)}</Text>
              </View>
            </View>

            {/* Dashboard Overview Title */}
            <View style={styles.overviewTitleContainer}>
              <Text style={styles.overviewTitle}>Dashboard Overview</Text>
            </View>

            {/* Status Cards - Stacked Vertically */}
            <View style={styles.cardsContainer}>
              <TouchableOpacity 
                style={[styles.statusCard, activeTab === 'open' && styles.activeStatusCard]}
                onPress={() => setActiveTab('open')}
              >
                <Ionicons name="chatbubble-outline" size={28} color={activeTab === 'open' ? '#2196F3' : '#757575'} style={styles.cardIcon} />
                <Text style={[styles.statusCardTitle, activeTab === 'open' && styles.activeStatusCardTitle]}>
                  Open Tickets
                </Text>
                <Text style={styles.cardCount}>{openTickets}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusCard, activeTab === 'progress' && styles.activeStatusCard]}
                onPress={() => setActiveTab('progress')}
              >
                <Ionicons name="bookmark-outline" size={28} color={activeTab === 'progress' ? '#2196F3' : '#757575'} style={styles.cardIcon} />
                <Text style={[styles.statusCardTitle, activeTab === 'progress' && styles.activeStatusCardTitle]}>
                  In Progress
                </Text>
                <Text style={styles.cardCount}>{inProgress}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusCard, activeTab === 'resolved' && styles.activeStatusCard]}
                onPress={() => setActiveTab('resolved')}
              >
                <Ionicons name="heart-outline" size={28} color={activeTab === 'resolved' ? '#2196F3' : '#757575'} style={styles.cardIcon} />
                <Text style={[styles.statusCardTitle, activeTab === 'resolved' && styles.activeStatusCardTitle]}>
                  Resolved
                </Text>
                <Text style={styles.cardCount}>{resolved}</Text>
              </TouchableOpacity>
            </View>

            {/* Tickets Section */}
            <View style={styles.ticketsSection}>
              <Text style={styles.sectionTitle}>{getTabTitle()}</Text>
              
              {filteredIncidents.length === 0 ? (
                <View style={styles.emptyTickets}>
                  <Text style={styles.emptyText}>No {getTabTitle().toLowerCase()}</Text>
                </View>
              ) : (
                filteredIncidents.map((incident) => {
                  const primaryCategory = incident.categories[0];
                  const categoryConfig = CATEGORY_CONFIG[primaryCategory];
                  
                  return (
                    <TouchableOpacity
                      key={incident.id}
                      style={styles.ticketCard}
                      onPress={() => router.push({ 
                        pathname: '/incident-details', 
                        params: { id: incident.id.toString() } 
                      })}
                    >
                      <View style={styles.ticketHeader}>
                        <View style={styles.reporterInfo}>
                          <Text style={styles.reporterName}>
                            Reporter: {incident.user?.name || 'Unknown'}
                          </Text>
                          <Text style={styles.reporterNumber}>
                            Number: {incident.user?.phone || 'N/A'}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={[styles.checkButton, { 
                            backgroundColor: activeTab === 'resolved' ? '#34C759' : '#FFC107' 
                          }]}
                          onPress={() => router.push({ 
                            pathname: '/incident-details', 
                            params: { id: incident.id.toString() } 
                          })}
                        >
                          <Text style={styles.checkButtonText}>
                            {activeTab === 'resolved' ? 'View' : 'Check'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.ticketDetails}>
                        {/* Show the actual emergency type (title) */}
                        <Text style={styles.emergencyTitle}>
                          {incident.title}
                        </Text>
                        <Text style={styles.detailText}>
                          Location: {incident.location?.address || 'Location not specified'}
                        </Text>
                        <Text style={styles.detailText}>
                          Service: {categoryConfig?.label || 'Emergency'}
                        </Text>
                        <View style={styles.dateTimeRow}>
                          <Text style={styles.detailText}>
                            Date: {new Date(incident.created_at).toLocaleDateString()}
                          </Text>
                          <Text style={styles.detailText}>
                            Time: {new Date(incident.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Regular user dashboard (existing code) - RED GRADIENT
  if (user?.role === 'user') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[COLORS.background.white, COLORS.background.white, COLORS.primary.red]}
          locations={[0, 0.4, 1]}
          style={styles.gradient}
        >
          <ScrollView
            style={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hello, {user.name}!</Text>
                <Text style={styles.subtitle}>Stay safe and connected</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Services</Text>
              <Text style={styles.sectionDescription}>Tap to report emergency or call station</Text>

              {/* Police Card */}
              <TouchableOpacity
                style={styles.emergencyCard}
                onPress={() => handleCardPress('police')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../local-assets/police-bg-home.webp')}
                  style={styles.cardBackground}
                  resizeMode="cover"
                />
                <View style={[styles.cardOverlay, { backgroundColor: 'rgba(25, 55, 109, 0.7)' }]} />
                <View style={styles.cardContent}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.cardTitle}>POLICE</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Report to the police for safety and protection
                  </Text>
                  <View style={styles.emergencyTypes}>
                    <Text style={styles.emergencyType}>Theft | Robbery | Assault | Fraud | Homicide | Vehicular Accident | Hit-and-Run | Reckless Driving | Drunk Driving (DUI)</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card press
                      const policeStation = MOCK_STATIONS.find(s => s.type === 'police');
                      if (policeStation) handleCall(policeStation.contact_number);
                    }}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>Call Police</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {/* Ambulance Card */}
              <TouchableOpacity
                style={styles.emergencyCard}
                onPress={() => handleCardPress('ambulance')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../local-assets/ambulance-bg-home.webp')}
                  style={styles.cardBackground}
                  resizeMode="cover"
                />
                <View style={[styles.cardOverlay, { backgroundColor: 'rgba(220, 38, 38, 0.7)' }]} />
                <View style={styles.cardContent}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.cardTitle}>AMBULANCE</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Report to the ambulance for medical emergencies
                  </Text>
                  <View style={styles.emergencyTypes}>
                    <Text style={styles.emergencyType}>Medical Emergency Report | Accident Injury Report</Text>
                    <Text style={styles.emergencyType}>Cardiac Arrest Report | Trauma or Wound Report | Patient Transport Report</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card press
                      const ambulanceStation = MOCK_STATIONS.find(s => s.type === 'ambulance');
                      if (ambulanceStation) handleCall(ambulanceStation.contact_number);
                    }}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>Call Ambulance</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {/* Firefighters Card */}
              <TouchableOpacity
                style={styles.emergencyCard}
                onPress={() => handleCardPress('fire')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../local-assets/firetruck-bg-home.jpg')}
                  style={styles.cardBackground}
                  resizeMode="cover"
                />
                <View style={[styles.cardOverlay, { backgroundColor: 'rgba(194, 65, 12, 0.7)' }]} />
                <View style={styles.cardContent}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.cardTitle}>FIREFIGHTERS</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Report to the firefighters for fire or rescue help
                  </Text>
                  <View style={styles.emergencyTypes}>
                    <Text style={styles.emergencyType}>Fire incident Report | Rescue Operation Report</Text>
                    <Text style={styles.emergencyType}>Explosion Report | Fire Investigation Report</Text>
                    <Text style={styles.emergencyType}>Hazardous Materials (Hazmat) Report</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card press
                      const fireStation = MOCK_STATIONS.find(s => s.type === 'fire');
                      if (fireStation) handleCall(fireStation.contact_number);
                    }}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>Call Firefighters</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Admin dashboard (existing code) - RED GRADIENT
  const userIncidents = incidents;
  
  // FIXED: Correct status counts for admin
  const pendingCount = userIncidents.filter((i) => i.status === 'pending').length;
  const activeCount = userIncidents.filter((i) => i.status === 'accepted' || i.status === 'in_progress').length;
  const completedCount = userIncidents.filter((i) => i.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.background.white, COLORS.background.white, COLORS.primary.red]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {user?.role && ['police_station', 'fire_station', 'ambulance'].includes(user.role)
                  ? 'Station Dashboard'
                  : 'Admin Dashboard'}
              </Text>
              <Text style={styles.subtitle}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.status.warningBg }]}>
                <Ionicons name="alert-circle" size={20} color={COLORS.status.warning} />
              </View>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.status.infoBg }]}>
                <Ionicons name="alert-circle" size={20} color={COLORS.status.info} />
              </View>
              <Text style={styles.statValue}>{activeCount}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.status.successBg }]}>
                <Ionicons name="alert-circle" size={20} color={COLORS.status.success} />
              </View>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Incidents</Text>
            {pendingCount === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pending incidents</Text>
              </View>
            ) : (
              incidents
                .filter((i) => i.status === 'pending')
                .map((incident) => {
                  const primaryCategory = incident.categories[0];
                  const categoryConfig = CATEGORY_CONFIG[primaryCategory];
                  return (
                    <TouchableOpacity
                      key={incident.id}
                      style={styles.incidentCard}
                      onPress={() => router.push({ pathname: '/incident-details', params: { id: incident.id.toString() } })}
                    >
                      <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
                        <Text style={styles.categoryText}>{categoryConfig.label}</Text>
                      </View>
                      <Text style={styles.incidentTitle}>{incident.title}</Text>
                      <Text style={styles.incidentDescription} numberOfLines={2}>
                        {incident.description}
                      </Text>
                      <Text style={styles.incidentTime}>
                        {new Date(incident.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </TouchableOpacity>
                  );
                })
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Helper function to get role title
function getRoleTitle(role: string): string {
  switch (role) {
    case 'police_station':
      return 'Police Officer';
    case 'ambulance':
      return 'Medical Responder';
    case 'fire_station':
      return 'Firefighter';
    default:
      return 'Responder';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Station Dashboard Styles with Yellow Theme
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  headerTextContainer: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000ff',
    textAlign: 'left',
  },
  overviewTitleContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  // Status Cards for Station Dashboard - Vertical Stack
  cardsContainer: {
    flexDirection: 'column',
    padding: 16,
    gap: 12,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStatusCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  cardIcon: {
    marginRight: 0,
  },
  cardIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginBottom: 12,
  },
  activeCardIndicator: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusCardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#757575',
    textAlign: 'center',
  },
  activeStatusCardTitle: {
    color: '#1565C0',
  },
  cardCount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#424242',
  },
  ticketsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reporterInfo: {
    flex: 1,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reporterNumber: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyTickets: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Existing styles for user dashboard
  header: {
    padding: 24,
    backgroundColor: COLORS.background.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  emergencyCard: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  titleContainer: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
    lineHeight: 16,
  },
  emergencyTypes: {
    gap: 2,
  },
  emergencyType: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 11,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: COLORS.background.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  incidentCard: {
    backgroundColor: COLORS.background.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.white,
    textTransform: 'uppercase',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  incidentDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  incidentTime: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});