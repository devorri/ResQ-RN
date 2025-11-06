import { CATEGORY_CONFIG } from '@/constants/category';
import { COLORS } from '@/constants/colors';
import { useIncidents } from '@/contexts/IncidentContext';
import { IncidentCategory } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createIncident } = useIncidents();

  // Get the pre-selected category from URL params
  const preselectedCategory = params.category as IncidentCategory;
  
  const [categories, setCategories] = useState<IncidentCategory[]>(
    preselectedCategory ? [preselectedCategory] : []
  );
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('');
  const [images, setImages] = useState<Array<{
    uri: string;
    type: string;
    name: string;
    id: string;
  }>>([]);
  const [video, setVideo] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Emergency types categorized by service
  const emergencyTypes = {
    police: [
      'Crime Incident',
      'Traffic Accident',
      'Public Disturbance',
      'Disaster or Calamity'
    ],
    ambulance: [
      'Medical Emergency',
      'Accident',
      'Disaster Medical Response'
    ],
    fire: [
      'Fire Incident',
      'Rescue Operation',
      'Flood Incident',
      'Disaster Response'
    ]
  };

  // Get dynamic header title based on selected service
  const getHeaderTitle = () => {
    if (categories.length > 0) {
      const config = CATEGORY_CONFIG[categories[0]];
      return `${config.label} Report`;
    }
    return 'Emergency Report';
  };

  // Get the appropriate emergency types based on selected category
  const getEmergencyTypes = () => {
    if (categories.length > 0) {
      return emergencyTypes[categories[0]] || [];
    }
    return [];
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Auto-set emergency type based on selected service for better UX
  useEffect(() => {
    if (preselectedCategory && !selectedEmergencyType) {
      const config = CATEGORY_CONFIG[preselectedCategory];
      setSelectedEmergencyType(`${config.label} Assistance Needed`);
    }
  }, [preselectedCategory]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to report incidents.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const address = addressResponse[0]
        ? `${addressResponse[0].street || ''}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
        : undefined;

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Failed to get your current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newImage = {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `incident_${Date.now()}.jpg`,
          id: Date.now().toString(),
        };
        setImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const takeVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to record videos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'videos' as any,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 30, // 30 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setVideo({
          uri: asset.uri,
          type: 'video/mp4',
          name: `incident_${Date.now()}.mp4`,
        });
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!selectedEmergencyType.trim()) {
      Alert.alert('Validation Error', 'Please select a type of emergency.');
      return;
    }

    if (categories.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one service.');
      return;
    }

    if (!location) {
      Alert.alert('Location Error', 'Location is required. Please enable location services.');
      return;
    }

    setIsSubmitting(true);

    try {
      const incidentData = {
        title: selectedEmergencyType.trim(),
        description: '',
        categories: Array.isArray(categories) ? categories : [categories],
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        image_url: images.map(img => img.uri).join(','), // Comma-separated image URLs
        video_url: video ? video.uri : undefined, // FIX: Use undefined instead of null
      };

      console.log('Submitting incident with categories:', incidentData.categories);

      await createIncident(incidentData);

      Alert.alert('Success', 'Incident reported successfully! Emergency services have been notified.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error submitting incident:', error);
      Alert.alert('Error', 'Failed to report incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentEmergencyTypes = getEmergencyTypes();
  const serviceLabel = categories.length > 0 ? CATEGORY_CONFIG[categories[0]]?.label : 'Emergency';
  const headerTitle = getHeaderTitle();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background.white, COLORS.background.white, COLORS.primary.red]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>

          {/* Emergency Type Dropdown */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Emergency Type</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={selectedEmergencyType ? styles.dropdownText : styles.dropdownPlaceholder}>
                {selectedEmergencyType || `Select ${serviceLabel.toLowerCase()} emergency type`}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>

            <Modal
              visible={dropdownVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setDropdownVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{serviceLabel} Emergency Types</Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                      <Ionicons name="close" size={24} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.dropdownList}>
                    {currentEmergencyTypes.length > 0 ? (
                      currentEmergencyTypes.map((type, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedEmergencyType(type);
                            setDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{type}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noOptions}>
                        <Text style={styles.noOptionsText}>
                          Please select a service first
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>

          {/* Camera Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Capture Photos & Videos</Text>
            <View style={styles.cameraSection}>
              {/* Images Grid */}
              {images.length > 0 && (
                <View style={styles.mediaGrid}>
                  {images.map((img) => (
                    <View key={img.id} style={styles.mediaContainer}>
                      <Image source={{ uri: img.uri }} style={styles.mediaPreview} />
                      <View style={styles.timestampOverlay}>
                        <Text style={styles.timestampText}>
                          {new Date().toLocaleString()}
                        </Text>
                        <Text style={styles.appStampText}>ResQ App</Text>
                      </View>
                      <TouchableOpacity style={styles.removeMediaButton} onPress={() => removeImage(img.id)}>
                        <Ionicons name="close" size={16} color={COLORS.text.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Video Preview */}
              {video && (
                <View style={styles.mediaContainer}>
                  <View style={styles.videoPreview}>
                    <Ionicons name="videocam" size={48} color={COLORS.text.secondary} />
                    <Text style={styles.videoText}>Video Recorded</Text>
                  </View>
                  <View style={styles.timestampOverlay}>
                    <Text style={styles.timestampText}>
                      {new Date().toLocaleString()}
                    </Text>
                    <Text style={styles.appStampText}>ResQ App</Text>
                  </View>
                  <TouchableOpacity style={styles.removeMediaButton} onPress={() => setVideo(null)}>
                    <Ionicons name="close" size={20} color={COLORS.text.white} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Media Buttons */}
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={24} color={COLORS.text.secondary} />
                  <Text style={styles.mediaButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={takeVideo}>
                  <Ionicons name="videocam" size={24} color={COLORS.text.secondary} />
                  <Text style={styles.mediaButtonText}>Record Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            {isLoadingLocation ? (
              <View style={styles.locationLoading}>
                <ActivityIndicator size="small" color={COLORS.primary.red} />
                <Text style={styles.locationLoadingText}>Getting your location...</Text>
              </View>
            ) : location ? (
              <View style={styles.locationCard}>
                <Ionicons name="location" size={20} color={COLORS.status.success} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationCoords}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                  {location.address && <Text style={styles.locationAddress}>{location.address}</Text>}
                </View>
              </View>
            ) : (
              <View style={styles.locationError}>
                <Ionicons name="alert-circle" size={20} color={COLORS.status.error} />
                <Text style={styles.locationErrorText}>Failed to get location</Text>
                <TouchableOpacity onPress={requestLocationPermission}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Disclaimer Section */}
          <View style={styles.disclaimerSection}>
            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              It is recommended to capture photos using the in-app camera feature, as it automatically includes a timestamp to verify that the image was taken in real time.
            </Text>
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Header Styles
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary.red,
    textAlign: 'center',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE6E6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
 
  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  // Dropdown Styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.white,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: COLORS.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.background.white,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.gray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  noOptions: {
    padding: 32,
    alignItems: 'center',
  },
  noOptionsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  // Camera Section Styles
  cameraSection: {
    backgroundColor: COLORS.background.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: COLORS.background.gray,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  // Media Styles
  mediaContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    width: 100,
    height: 100,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.background.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timestampText: {
    fontSize: 8,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  appStampText: {
    fontSize: 6,
    color: COLORS.text.white,
    fontWeight: '400',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.status.error,
    borderRadius: 12,
    padding: 4,
  },
  // Location Styles
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationLoadingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  locationInfo: {
    flex: 1,
  },
  locationCoords: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  locationError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.errorBg,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationErrorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.status.error,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.status.error,
  },
  // Disclaimer Section
  disclaimerSection: {
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary.red,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  // Submit Section
  submitSection: {
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: COLORS.primary.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});