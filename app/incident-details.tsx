import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/constants/category';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { incidents, acceptIncident, markInProgress, completeIncident } = useIncidents();
  const { user } = useAuth();
  
  // Video player ref
  const videoRef = useRef<Video>(null);

  // Photo viewer state
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Fix: Compare as strings, don't convert to number
  const incident = incidents.find((i) => {
    const incidentId = typeof i.id === 'number' ? i.id.toString() : i.id;
    return incidentId === id;
  });

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.status.error} />
          <Text style={styles.errorText}>Incident not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const primaryCategory = incident.categories[0];
  const categoryConfig = CATEGORY_CONFIG[primaryCategory];
  const statusConfig = STATUS_CONFIG[incident.status];

  // Parse multiple images from comma-separated string
  const imageUrls = incident.image_url 
    ? incident.image_url.split(',').filter(url => url.trim() !== '')
    : [];

  // Photo viewer functions
  const openPhotoViewer = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoViewerVisible(true);
  };

  const closePhotoViewer = () => {
    setPhotoViewerVisible(false);
  };

  const goToNextPhoto = () => {
    if (selectedPhotoIndex < imageUrls.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const goToPrevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  // Correct status flow
  const canAccept = user?.role !== 'user' && incident.status === 'pending';
  const canMarkInProgress = user?.role !== 'user' && incident.status === 'accepted';
  const canComplete = user?.role !== 'user' && incident.status === 'in_progress';

  const handleAccept = async () => {
    try {
      await acceptIncident(incident.id);
    } catch (error) {
      console.error('Failed to accept incident:', error);
    }
  };

  const handleMarkInProgress = async () => {
    try {
      await markInProgress(incident.id);
    } catch (error) {
      console.error('Failed to mark in progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeIncident(incident.id, 'Incident resolved successfully');
    } catch (error) {
      console.error('Failed to complete incident:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Multiple Images Section */}
        {imageUrls.length > 0 && (
          <View style={styles.mediaSection}>
            <Text style={styles.mediaSectionTitle}>
              Photos ({imageUrls.length})
            </Text>
            <ScrollView 
              horizontal 
              style={styles.imagesScrollView}
              showsHorizontalScrollIndicator={true}
            >
              {imageUrls.map((url, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.imageContainer}
                  onPress={() => openPhotoViewer(index)}
                >
                  <Image 
                    source={{ uri: url.trim() }} 
                    style={styles.image} 
                    resizeMode="cover" 
                  />
                  <View style={styles.imageNumberBadge}>
                    <Text style={styles.imageNumberText}>{index + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Video Section */}
        {incident.video_url && (
          <View style={styles.mediaSection}>
            <Text style={styles.mediaSectionTitle}>Video</Text>
            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={{ uri: incident.video_url }}
                style={styles.videoPlayer}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls={true}
                shouldPlay={false}
              />
            </View>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.badgesRow}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
                <Text style={styles.categoryText}>{categoryConfig.label}</Text>
              </View>
            </View>

            <Text style={styles.title}>{incident.title}</Text>
            <Text style={styles.description}>{incident.description}</Text>

            <View style={[styles.statusContainer, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                Status: {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>{incident.location?.address || 'Location not available'}</Text>
            </View>
            <Text style={styles.coordinates}>
              {incident.location?.latitude?.toFixed(6) || 'N/A'}, {incident.location?.longitude?.toFixed(6) || 'N/A'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reporter Information</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>{incident.user?.name || 'Unknown'}</Text>
            </View>
            {incident.user?.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={COLORS.text.secondary} />
                <Text style={styles.infoText}>{incident.user.phone}</Text>
              </View>
            )}
          </View>

          {incident.station && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned Station</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>{incident.station.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={COLORS.text.secondary} />
                <Text style={styles.infoText}>{incident.station.contact_number}</Text>
              </View>
            </View>
          )}

          {incident.responder && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Responder</Text>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={COLORS.text.secondary} />
                <Text style={styles.infoText}>{incident.responder.name}</Text>
              </View>
            </View>
          )}

          {incident.timeline && incident.timeline.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              {incident.timeline.map((update) => (
                <View key={update.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineMessage}>{update.message}</Text>
                    <Text style={styles.timelineTime}>
                      {new Date(update.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {incident.ai_analysis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <View style={styles.aiCard}>
                <Text style={styles.aiLabel}>Scene Description</Text>
                <Text style={styles.aiValue}>{incident.ai_analysis.scene_description}</Text>

                <Text style={styles.aiLabel}>Detected Objects</Text>
                <Text style={styles.aiValue}>
                  {incident.ai_analysis.detected_objects?.join(', ')}
                </Text>

                <Text style={styles.aiLabel}>Confidence</Text>
                <Text style={styles.aiValue}>
                  Authenticity: {(incident.ai_analysis.confidence_scores?.authenticity * 100).toFixed(0)}%
                </Text>

                {incident.ai_analysis.recommendations && (
                  <>
                    <Text style={styles.aiLabel}>Recommendations</Text>
                    <Text style={styles.aiValue}>{incident.ai_analysis.recommendations}</Text>
                  </>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Photo Viewer Modal */}
      <Modal
        visible={photoViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePhotoViewer}
      >
        <View style={styles.photoViewerContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closePhotoViewer}>
            <Ionicons name="close" size={28} color={COLORS.text.white} />
          </TouchableOpacity>

          {/* Photo Counter */}
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              {selectedPhotoIndex + 1} / {imageUrls.length}
            </Text>
          </View>

          {/* Main Photo */}
          <Image 
            source={{ uri: imageUrls[selectedPhotoIndex]?.trim() }} 
            style={styles.fullScreenImage}
            resizeMode="contain"
          />

          {/* Navigation Arrows */}
          {imageUrls.length > 1 && (
            <>
              {selectedPhotoIndex > 0 && (
                <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={goToPrevPhoto}>
                  <Ionicons name="chevron-back" size={32} color={COLORS.text.white} />
                </TouchableOpacity>
              )}
              {selectedPhotoIndex < imageUrls.length - 1 && (
                <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={goToNextPhoto}>
                  <Ionicons name="chevron-forward" size={32} color={COLORS.text.white} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Modal>

      {/* Action Buttons - Correct Status Flow */}
      {canAccept && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.8}>
            <Text style={styles.acceptButtonText}>Accept Incident</Text>
          </TouchableOpacity>
        </View>
      )}

      {canMarkInProgress && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.inProgressButton} onPress={handleMarkInProgress} activeOpacity={0.8}>
            <Text style={styles.inProgressButtonText}>Going to Area</Text>
          </TouchableOpacity>
        </View>
      )}

      {canComplete && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
            <Text style={styles.completeButtonText}>Mark as Resolved</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollView: {
    flex: 1,
  },
  // Media Section Styles
  mediaSection: {
    backgroundColor: COLORS.background.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  mediaSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  imagesScrollView: {
    flexGrow: 0,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: COLORS.border.light,
  },
  imageNumberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.white,
  },
  videoContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  // Photo Viewer Styles
  photoViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  photoCounter: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  photoCounterText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.white,
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 12,
    transform: [{ translateY: -25 }],
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.white,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.background.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
  },
  coordinates: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.status.info,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineMessage: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  aiCard: {
    backgroundColor: COLORS.background.light,
    padding: 12,
    borderRadius: 8,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  aiValue: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.background.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  acceptButton: {
    backgroundColor: COLORS.status.info,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.white,
  },
  inProgressButton: {
    backgroundColor: '#FF9800', // Orange color for in progress
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  inProgressButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: COLORS.status.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.status.info,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.white,
  },
});