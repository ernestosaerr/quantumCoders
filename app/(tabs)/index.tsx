import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import WeatherDataCard from '@/components/WeatherDataCard';
import WeatherMap from '@/components/WeatherMap';
import { NasaApiService } from '@/services/nasaApi';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

interface WeatherData {
  temperature: number;
  location: string;
  humidity?: number;
  windSpeed?: number;
  airQuality?: number;
  lastUpdated?: string;
}

export default function HomeScreen() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Buscar ubicación usando geocodificación
      const locations = await NasaApiService.geocodeLocation(query);
      
      console.log('=== UBICACIONES ENCONTRADAS ===');
      console.log('Query:', query);
      console.log('Número de ubicaciones:', locations.length);
      console.log('Ubicaciones:', locations);
      
      if (locations.length === 0) {
        Alert.alert('Error', 'No se encontró la ubicación especificada');
        return;
      }
      
      // Usar la primera ubicación encontrada
      const location = locations[0];
      console.log('=== UBICACIÓN SELECCIONADA ===');
      console.log('Ubicación seleccionada:', location);
      setSelectedLocation(location);
      
      // Obtener datos climáticos de la NASA
      console.log('=== OBTENIENDO DATOS CLIMÁTICOS ===');
      const weatherData = await NasaApiService.getTemperatureData(location);
      console.log('=== DATOS CLIMÁTICOS OBTENIDOS ===');
      console.log('Weather data:', weatherData);
      setWeatherData(weatherData);
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      Alert.alert('Error', 'No se pudo obtener los datos climáticos');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPress = async () => {
    setLoading(true);
    try {
      console.log('=== SOLICITANDO PERMISOS DE UBICACIÓN ===');
      
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de ubicación',
          'Se necesitan permisos de ubicación para obtener datos climáticos de tu área actual.'
        );
        return;
      }

      console.log('=== OBTENIENDO UBICACIÓN ACTUAL ===');
      
      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('=== UBICACIÓN OBTENIDA ===');
      console.log('Coordenadas:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      // Crear objeto de ubicación
      const currentLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        name: 'Mi ubicación actual'
      };

      console.log('=== UBICACIÓN PROCESADA ===');
      console.log('Location data:', currentLocation);
      
      setSelectedLocation(currentLocation);

      // Obtener datos climáticos para la ubicación actual
      console.log('=== OBTENIENDO DATOS CLIMÁTICOS PARA UBICACIÓN ACTUAL ===');
      const weatherData = await NasaApiService.getTemperatureData(currentLocation);
      console.log('=== DATOS CLIMÁTICOS OBTENIDOS ===');
      console.log('Weather data:', weatherData);
      setWeatherData(weatherData);

    } catch (error) {
      console.error('Error en geolocalización:', error);
      Alert.alert(
        'Error de ubicación', 
        'No se pudo obtener tu ubicación actual. Verifica que los servicios de ubicación estén habilitados.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (location: LocationData) => {
    setSelectedLocation(location);
    setLoading(true);
    
    try {
      // Obtener datos climáticos reales de la NASA para la nueva ubicación
      const weatherData = await NasaApiService.getTemperatureData(location);
      setWeatherData(weatherData);
    } catch (error) {
      console.error('Error al obtener datos climáticos:', error);
      Alert.alert('Error', 'No se pudieron obtener los datos climáticos para esta ubicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Barra de búsqueda */}
        <SearchBar 
          onSearch={handleSearch}
          onLocationPress={handleLocationPress}
        />
        
        {/* Contenedor de datos climáticos */}
        <WeatherDataCard 
          data={weatherData}
          loading={loading}
        />
        
        {/* Mapa de ubicación */}
        <WeatherMap 
          location={selectedLocation}
          onLocationChange={handleLocationChange}
          loading={loading}
        />
        
        {/* Información adicional */}
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>
            🌍 Tlaloc - Datos Climáticos de la NASA
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Explora datos de observación de la Tierra y obtén información sobre 
            condiciones climáticas específicas en cualquier ubicación del mundo.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});
