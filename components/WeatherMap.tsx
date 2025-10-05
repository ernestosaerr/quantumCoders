import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

interface WeatherMapProps {
  location: LocationData | null;
  onLocationChange: (location: LocationData) => void;
  loading?: boolean;
}

export default function WeatherMap({ 
  location, 
  onLocationChange, 
  loading = false 
}: WeatherMapProps) {
  const mapRef = useRef<MapView>(null);

  // Animar el mapa cada vez que cambia la ubicación
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500); // duración animación
    }
  }, [location]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Se necesita acceso a la ubicación para usar esta función.'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Obtener nombre del lugar
      const response = await Location.reverseGeocodeAsync({ latitude, longitude });
      const placeName = response[0]?.city || response[0]?.region || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      onLocationChange({ latitude, longitude, name: placeName });

    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  const openInMaps = () => {
    if (location) {
      const url = Platform.select({
        ios: `maps:0,0?q=${location.latitude},${location.longitude}`,
        android: `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={location.name}
              description={`Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`}
            />
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={64} color="#007AFF" />
            <ThemedText style={styles.mapPlaceholderText}>
              Selecciona una ubicación para ver el mapa
            </ThemedText>
            <TouchableOpacity 
              style={styles.getLocationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="locate" size={20} color="#FFFFFF" />
              <ThemedText style={styles.getLocationText}>
                Obtener mi ubicación
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Botones de control */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={20} color="#007AFF" />
          </TouchableOpacity>

          {location && (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={openInMaps}
            >
              <Ionicons name="navigate" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ThemedText style={styles.loadingText}>Cargando ubicación...</ThemedText>
          </View>
        )}
      </View>

      {location && (
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color="#007AFF" />
          <ThemedText style={styles.locationText}>{location.name}</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1, borderRadius: 12, margin: 8, backgroundColor: '#F8F9FA', minHeight: 300 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, margin: 8, padding: 20 },
  mapPlaceholderText: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginTop: 16, textAlign: 'center', marginBottom: 20 },
  getLocationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  getLocationText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  controlsContainer: { position: 'absolute', top: 16, right: 16, flexDirection: 'column', gap: 8 },
  controlButton: { backgroundColor: '#FFFFFF', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', fontSize: 16 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F5F5F5', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  locationText: { marginLeft: 6, fontSize: 14, color: '#333', fontWeight: '500' },
});
