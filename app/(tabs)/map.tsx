import { CATEGORY_CONFIG } from '@/constants/category';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { Incident, Station } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;
let Region: any;
let Callout: any;

if (Platform.OS !== 'web') {
  const mapModule = require('react-native-maps');
  MapView = mapModule.default;
  Marker = mapModule.Marker;
  PROVIDER_GOOGLE = mapModule.PROVIDER_GOOGLE;
  Region = mapModule.Region;
  Callout = mapModule.Callout;
}

const INITIAL_REGION = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { incidents } = useIncidents();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(INITIAL_REGION);
  const [showResponseCard, setShowResponseCard] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your location on the map.');
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setUserLocation(newLocation);
      setRegion({
        ...newLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Get real stations with is_active field
  const realStations: Station[] = [
    {
      id: 1,
      name: 'Angeles City Police Station',
      type: 'police',
      address: 'Angeles City, Pampanga',
      contact_number: '+639123456789',
      latitude: 14.5995,
      longitude: 120.9842,
      is_active: true,
    },
    {
      id: 2,
      name: 'Angeles City Fire Station',
      type: 'fire',
      address: 'Angeles City, Pampanga',
      contact_number: '+639123456790',
      latitude: 14.6000,
      longitude: 120.9850,
      is_active: true,
    },
    {
      id: 3,
      name: 'Angeles City Ambulance',
      type: 'ambulance',
      address: 'Angeles City, Pampanga',
      contact_number: '+639123456791',
      latitude: 14.5985,
      longitude: 120.9835,
      is_active: true,
    }
  ];

  const renderStationMarker = (station: Station) => {
    if (Platform.OS === 'web') return null;
    const categoryConfig = CATEGORY_CONFIG[station.type];
    return (
      <Marker
        key={`station-${station.id}`}
        coordinate={{
          latitude: station.latitude,
          longitude: station.longitude,
        }}
        pinColor={categoryConfig.color}
        title={station.name}
        description={station.address}
      >
        <Callout>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>{station.name}</Text>
            <Text style={styles.calloutDescription}>{station.address}</Text>
            <Text style={styles.calloutContact}>{station.contact_number}</Text>
            <Text style={styles.calloutStatus}>
              Status: {station.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  const renderIncidentMarker = (incident: Incident) => {
    if (Platform.OS === 'web') return null;
    const primaryCategory = incident.categories[0];
    const categoryConfig = CATEGORY_CONFIG[primaryCategory];
    return (
      <Marker
        key={`incident-${incident.id}`}
        coordinate={{
          latitude: incident.location.latitude,
          longitude: incident.location.longitude,
        }}
        pinColor={categoryConfig.color}
        onPress={() => {
          setSelectedIncident(incident);
          setShowResponseCard(true);
        }}
      >
        <View style={[styles.incidentMarker, { backgroundColor: categoryConfig.color }]}>
          <Text style={styles.incidentMarkerText}>!</Text>
        </View>
        <Callout>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>{incident.title}</Text>
            <View style={styles.categoriesContainer}>
              {incident.categories.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                return (
                  <View key={cat} style={[styles.categoryBadge, { backgroundColor: config.color }]}>
                    <Text style={styles.categoryBadgeText}>{config.label}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.calloutDescription}>{incident.description}</Text>
            <Text style={[styles.statusBadge, { color: categoryConfig.color }]}>{incident.status.toUpperCase()}</Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  const handleCallStation = () => {
    if (selectedIncident) {
      const stationType = selectedIncident.categories[0];
      const station = realStations.find(s => s.type === stationType);
      if (station) {
        Alert.alert(
          'Call Station',
          `Call ${station.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => {
              console.log('Calling station:', station.contact_number);
              // In a real app, you would use Linking.openURL(`tel:${station.contact_number}`)
            }}
          ]
        );
      }
    }
  };

  if (isLoadingLocation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  // REGULAR USERS CANNOT SEE ACTIVE INCIDENTS - only emergency services can
  const canSeeIncidents = user?.role !== 'user';
  const activeIncidents = canSeeIncidents 
    ? incidents.filter(i => i.status === 'pending' || i.status === 'accepted' || i.status === 'in_progress')
    : [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 24 + insets.top }]}>
        <View>
          <Text style={styles.title}>Live Map</Text>
          <Text style={styles.subtitle}>
            {realStations.length} emergency station{realStations.length !== 1 ? 's' : ''}
            {canSeeIncidents && activeIncidents.length > 0 && ` • ${activeIncidents.length} active incident${activeIncidents.length !== 1 ? 's' : ''}`}
          </Text>
          {!canSeeIncidents && (
            <Text style={styles.userNote}>
              Emergency stations near you
            </Text>
          )}
        </View>
      </View>

      {Platform.OS === 'web' ? (
        <View style={styles.map}>
          <View style={styles.webMapPlaceholder}>
            <Text style={styles.webMapText}>Map View (Web Version)</Text>
            <Text style={styles.webMapSubtext}>
              Showing {realStations.length} emergency stations
              {canSeeIncidents && ` and ${activeIncidents.length} active incidents`}
            </Text>
            <Text style={styles.webMapNote}>
              Location: {userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : 'Loading...'}
            </Text>
            {!canSeeIncidents && (
              <Text style={styles.privacyNote}>
                Active incident locations are only visible to emergency services
              </Text>
            )}
          </View>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsTraffic={false}
        >
          {realStations.map((station) => renderStationMarker(station))}
          {canSeeIncidents && activeIncidents.map((incident) => renderIncidentMarker(incident))}
        </MapView>
      )}

      {/* Show Card Button - Only show if user can see incidents and there are active ones */}
      {!showResponseCard && canSeeIncidents && activeIncidents.length > 0 && (
        <TouchableOpacity 
          style={styles.showCardButton}
          onPress={() => {
            setSelectedIncident(activeIncidents[0]);
            setShowResponseCard(true);
          }}
        >
          <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
          <Text style={styles.showCardText}>{activeIncidents.length}</Text>
        </TouchableOpacity>
      )}

      {/* Response Card - Only show for emergency service users */}
      {showResponseCard && selectedIncident && canSeeIncidents && (
        <View style={styles.floatingCard}>
          <View style={styles.cardContent}>
            <View style={styles.arrivalTimeContainer}>
              <Text style={styles.arrivalTimeText}>Response Required</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.department}>
                {selectedIncident.categories.includes('police') ? 'Police Incident' :
                 selectedIncident.categories.includes('fire') ? 'Fire Department Incident' :
                 'Medical Emergency'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.incidentTitle}>{selectedIncident.title}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.statusText}>Status: {selectedIncident.status.toUpperCase()}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Location</Text>
              <Text style={styles.locationText}>
                {selectedIncident.location.address || 'Location not specified'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Emergency Type</Text>
              <Text style={styles.emergencyType}>
                {selectedIncident.categories.map(cat => CATEGORY_CONFIG[cat].label).join(', ')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{selectedIncident.description}</Text>
            </View>

            <TouchableOpacity style={styles.callButton} onPress={handleCallStation}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call Station</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowResponseCard(false)}
          >
            <Ionicons name="close" size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  map: {
    flex: 1,
  },
  incidentMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  incidentMarkerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900' as const,
  },
  callout: {
    minWidth: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  calloutContact: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600' as const,
  },
  calloutStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600' as const,
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  floatingCard: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  arrivalTimeContainer: {
    backgroundColor: '#DC2626', 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  arrivalTimeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 12,
  },
  department: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 18,
  },
  emergencyType: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 18,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showCardButton: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  showCardText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    padding: 24,
  },
  webMapText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  webMapNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  privacyNote: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});