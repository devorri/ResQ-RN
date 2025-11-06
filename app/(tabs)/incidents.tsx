import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/constants/category';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncidentsScreen() {
  const router = useRouter();
  const { incidents } = useIncidents();
  const { user } = useAuth();

  // Helper function to normalize IDs for comparison
  const normalizeId = (id: string | number | undefined): string => {
    if (id === undefined) return '';
    return typeof id === 'number' ? id.toString() : id;
  };

  // Filter incidents based on user role
  const userIncidents = user?.role === 'user' 
    ? incidents.filter((i) => normalizeId(i.user_id) === normalizeId(user?.id))
    : user?.role === 'police_station'
    ? incidents.filter((i) => i.categories.includes('police'))
    : user?.role === 'fire_station'
    ? incidents.filter((i) => i.categories.includes('fire'))
    : user?.role === 'ambulance'
    ? incidents.filter((i) => i.categories.includes('ambulance'))
    : incidents;

  const handleIncidentPress = (incidentId: string | number) => {
    // Always convert to string for router params
    const idString = typeof incidentId === 'number' ? incidentId.toString() : incidentId;
    router.push({
      pathname: '/incident-details',
      params: { id: idString }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {user?.role === 'user' ? 'My Incidents' : 'All Incidents'}
        </Text>
        <Text style={styles.subtitle}>{userIncidents.length} total</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {userIncidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {user?.role === 'user' 
                ? 'You haven\'t reported any incidents yet' 
                : 'No incidents found'
              }
            </Text>
          </View>
        ) : (
          userIncidents.map((incident) => {
            const statusConfig = STATUS_CONFIG[incident.status];
            return (
              <TouchableOpacity
                key={normalizeId(incident.id)} // Use normalized ID for key
                style={styles.incidentCard}
                onPress={() => handleIncidentPress(incident.id)}
              >
                <View style={styles.categoriesRow}>
                  {incident.categories.map((cat) => {
                    const categoryConfig = CATEGORY_CONFIG[cat];
                    return (
                      <View key={cat} style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
                        <Text style={styles.categoryText}>{categoryConfig.label}</Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.incidentTitle}>{incident.title}</Text>
                <Text style={styles.incidentDescription} numberOfLines={2}>
                  {incident.description}
                </Text>
                <View style={styles.incidentFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                  </View>
                  <Text style={styles.incidentTime}>
                    {new Date(incident.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  incidentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});