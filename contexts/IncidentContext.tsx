import { supabase } from '@/services/supabaseAuth';
import { CreateIncidentData, Incident, StationType } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo, useState } from 'react';

export const [IncidentContext, useIncidents] = createContextHook(() => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load incidents - using your actual table names and columns
  const loadIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          station:stations(id, name, type, address, contact_number),
          incident_updates(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match your Incident type
      const transformedIncidents: Incident[] = (data || []).map((incident) => ({
        id: incident.id,
        user_id: incident.user_id,
        station_id: incident.station_id,
        responder_id: incident.responder_id,
        categories: incident.categories || [],
        title: incident.title,
        description: incident.description,
        image_url: incident.image_url,
        location: {
          latitude: incident.latitude,
          longitude: incident.longitude,
          address: incident.address,
        },
        status: incident.status,
        severity: incident.severity,
        ai_analysis: incident.ai_analysis,
        priority_score: incident.priority_score,
        created_at: incident.created_at,
        accepted_at: incident.accepted_at,
        completed_at: incident.completed_at,
        response_time_minutes: incident.response_time_minutes,
        station: incident.station ? {
          id: incident.station.id,
          name: incident.station.name,
          type: incident.station.type as StationType,
          contact_number: incident.station.contact_number,
        } : undefined,
        timeline: (incident.incident_updates || []).map((update: any) => ({
          id: update.id,
          status: update.status,
          message: update.message,
          created_at: update.created_at,
        })),
        user: {
          id: incident.user_id,
          name: 'User',
        }
      }));

      setIncidents(transformedIncidents);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createIncident = useCallback(async (data: CreateIncidentData) => {
    try {
      setIsLoading(true);
      
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const { data: incidentData, error } = await supabase
        .from('incidents')
        .insert({
          user_id: userId,
          categories: data.categories,
          title: data.title,
          description: data.description,
          image_url: data.image?.uri,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          status: 'pending',
          severity: 'medium',
          priority_score: 50,
        })
        .select(`
          *,
          station:stations(id, name, type, address, contact_number)
        `)
        .single();

      if (error) throw error;
      
      if (incidentData) {
        await supabase
          .from('incident_updates')
          .insert({
            incident_id: incidentData.id,
            status: 'pending',
            message: 'Incident reported',
            user_id: userId,
          });

        const newIncident: Incident = {
          id: incidentData.id,
          user_id: incidentData.user_id,
          station_id: incidentData.station_id,
          responder_id: incidentData.responder_id,
          categories: incidentData.categories || [],
          title: incidentData.title,
          description: incidentData.description,
          image_url: incidentData.image_url,
          location: {
            latitude: incidentData.latitude,
            longitude: incidentData.longitude,
            address: incidentData.address,
          },
          status: incidentData.status,
          severity: incidentData.severity,
          ai_analysis: incidentData.ai_analysis,
          priority_score: incidentData.priority_score,
          created_at: incidentData.created_at,
          accepted_at: incidentData.accepted_at,
          completed_at: incidentData.completed_at,
          response_time_minutes: incidentData.response_time_minutes,
          station: incidentData.station ? {
            id: incidentData.station.id,
            name: incidentData.station.name,
            type: incidentData.station.type as StationType,
            contact_number: incidentData.station.contact_number,
          } : undefined,
          timeline: [
            {
              id: Date.now(),
              status: 'pending',
              message: 'Incident reported',
              created_at: new Date().toISOString(),
            }
          ],
          user: {
            id: incidentData.user_id,
            name: 'Current User',
          }
        };

        setIncidents((prev) => [newIncident, ...prev]);
        return newIncident;
      }
      
      throw new Error('Failed to create incident');
    } catch (error) {
      console.error('Failed to create incident:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptIncident = useCallback(async (incidentId: string | number) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // Update incident status in database
      const { error } = await supabase
        .from('incidents')
        .update({
          status: 'accepted',
          responder_id: userId,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', incidentId);

      if (error) throw error;

      // Add timeline entry
      await supabase
        .from('incident_updates')
        .insert({
          incident_id: incidentId,
          status: 'accepted',
          message: 'Incident accepted by responder',
          user_id: userId,
        });

      // Update local state immediately - this is the key fix
      setIncidents((prev) =>
        prev.map((incident) => {
          if (incident.id === incidentId) {
            return {
              ...incident,
              status: 'accepted',
              responder_id: userId ? parseInt(userId) : null,
              accepted_at: new Date().toISOString(),
              timeline: [
                ...(incident.timeline || []),
                {
                  id: Date.now(),
                  status: 'accepted',
                  message: 'Incident accepted by responder',
                  created_at: new Date().toISOString(),
                },
              ],
            };
          }
          return incident;
        })
      );

      // Don't call loadIncidents() here as it will overwrite our local state
      console.log('Incident accepted successfully');
    } catch (error) {
      console.error('Failed to accept incident:', error);
      throw error;
    }
  }, []); // Removed loadIncidents dependency

  const markInProgress = useCallback(async (incidentId: string | number) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // Update incident status in database
      const { error } = await supabase
        .from('incidents')
        .update({
          status: 'in_progress',
        })
        .eq('id', incidentId);

      if (error) throw error;

      // Add timeline entry
      await supabase
        .from('incident_updates')
        .insert({
          incident_id: incidentId,
          status: 'in_progress',
          message: 'Responder is on the way to the location',
          user_id: userId,
        });

      // Update local state immediately
      setIncidents((prev) =>
        prev.map((incident) => {
          if (incident.id === incidentId) {
            return {
              ...incident,
              status: 'in_progress',
              timeline: [
                ...(incident.timeline || []),
                {
                  id: Date.now(),
                  status: 'in_progress',
                  message: 'Responder is on the way to the location',
                  created_at: new Date().toISOString(),
                },
              ],
            };
          }
          return incident;
        })
      );

      console.log('Incident marked in progress successfully');
    } catch (error) {
      console.error('Failed to mark in progress:', error);
      throw error;
    }
  }, []); // Removed loadIncidents dependency

  const completeIncident = useCallback(async (incidentId: string | number, notes: string) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // Update incident status in database
      const { error } = await supabase
        .from('incidents')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', incidentId);

      if (error) throw error;

      // Add timeline entry
      await supabase
        .from('incident_updates')
        .insert({
          incident_id: incidentId,
          status: 'completed',
          message: notes || 'Incident completed',
          user_id: userId,
        });

      // Update local state immediately
      setIncidents((prev) =>
        prev.map((incident) => {
          if (incident.id === incidentId) {
            return {
              ...incident,
              status: 'completed',
              completed_at: new Date().toISOString(),
              timeline: [
                ...(incident.timeline || []),
                {
                  id: Date.now(),
                  status: 'completed',
                  message: notes || 'Incident completed',
                  created_at: new Date().toISOString(),
                },
              ],
            };
          }
          return incident;
        })
      );

      console.log('Incident completed successfully');
    } catch (error) {
      console.error('Failed to complete incident:', error);
      throw error;
    }
  }, []); // Removed loadIncidents dependency

  const refreshIncidents = useCallback(async () => {
    try {
      await loadIncidents();
    } catch (error) {
      console.error('Failed to refresh incidents:', error);
      throw error;
    }
  }, [loadIncidents]);

  // Load incidents on mount
  useMemo(() => {
    loadIncidents();
  }, [loadIncidents]);

  return useMemo(
    () => ({
      incidents,
      selectedIncident,
      setSelectedIncident,
      createIncident,
      acceptIncident,
      markInProgress,
      completeIncident,
      refreshIncidents,
      isLoading,
    }),
    [
      incidents, 
      selectedIncident, 
      createIncident, 
      acceptIncident, 
      markInProgress,
      completeIncident, 
      refreshIncidents,
      isLoading
    ]
  );
});