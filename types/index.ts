export type UserRole = 'user' | 'police_station' | 'fire_station' | 'ambulance' | 'admin';

export type IncidentCategory = 'police' | 'fire' | 'ambulance';

export type IncidentStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type StationType = 'police' | 'fire' | 'ambulance';

export interface User {
  id: string; // CHANGED FROM number TO string FOR SUPABASE COMPATIBILITY
  name: string;
  email: string;
  role: UserRole;
  station_id: number | null;
  avatar_url: string | null;
  is_active: boolean;
  phone?: string;
  created_at: string;
  password?: string; // added for mock/default password support
}

export interface Station {
  id: number;
  name: string;
  type: StationType;
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  is_active: boolean;
  total_responses?: number;
  avg_response_time_minutes?: number;
  distance_km?: number;
}

export interface AIAnalysis {
  is_authentic: boolean;
  detected_type: string;
  suggested_category: IncidentCategory;
  severity_assessment: IncidentSeverity;
  detected_objects: string[];
  scene_description: string;
  confidence_scores: {
    authenticity: number;
    type_detection: number;
    severity: number;
  };
  recommendations: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ResponderLocation extends Location {
  accuracy?: number;
  speed?: number;
  heading?: number;
  updated_at: string;
}

export interface Incident {
  id: number;
  user_id: number;
  station_id: number | null;
  responder_id: number | null;
  categories: IncidentCategory[];
  title: string;
  description: string;
  image_url: string | null;
  location: Location;
  status: IncidentStatus;
  severity: IncidentSeverity;
  ai_analysis: AIAnalysis | null;
  priority_score: number;
  user: {
    id: number;
    name: string;
    phone?: string;
  };
  station?: {
    id: number;
    name: string;
    type: StationType;
    contact_number: string;
  };
  responder?: {
    id: number;
    name: string;
    current_location?: ResponderLocation;
  };
  timeline?: IncidentUpdate[];
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  response_time_minutes: number | null;
}

export interface IncidentUpdate {
  id: number;
  status: string;
  message: string;
  location?: Location;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface CreateIncidentData {
  title: string;
  description: string;
  categories: IncidentCategory[];
  latitude: number;
  longitude: number;
  address?: string;
  image?: {
    uri: string;
    type: string;
    name: string;
  };
}