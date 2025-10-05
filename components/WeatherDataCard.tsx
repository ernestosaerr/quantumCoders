import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface WeatherData {
  temperature: number;
  location: string;
  humidity?: number;
  windSpeed?: number;
  airQuality?: number;
  lastUpdated?: string;
}

interface WeatherDataCardProps {
  data: WeatherData | null;
  loading?: boolean;
}

export default function WeatherDataCard({ data, loading = false }: WeatherDataCardProps) {
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Cargando datos...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-outline" size={48} color="#999" />
          <ThemedText style={styles.emptyText}>
            Selecciona una ubicación para ver los datos climáticos
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#0A84FF" />
          <ThemedText style={styles.locationText}>{data.location}</ThemedText>
        </View>
        {data.lastUpdated && (
          <ThemedText style={styles.lastUpdated}>
            Actualizado: {data.lastUpdated}
          </ThemedText>
        )}
      </View>

      <View style={styles.mainData}>
        <View style={styles.temperatureContainer}>
          <ThemedText style={styles.temperature}>
            {Math.round(data.temperature)}°
          </ThemedText>
          <ThemedText style={styles.temperatureUnit}>C</ThemedText>
        </View>
        <View style={styles.weatherIcon}>
          <Ionicons
            name={getWeatherIcon(data.temperature)}
            size={28}
            color={getTemperatureColor(data.temperature)}
          />
        </View>
      </View>

      <View style={styles.additionalData}>
        {data.humidity !== undefined && (
          <View style={styles.dataItem}>
            <Ionicons name="water-outline" size={16} color="#64B5F6" />
            <ThemedText style={styles.dataLabel}>Humedad</ThemedText>
            <ThemedText style={styles.dataValue}>{data.humidity}%</ThemedText>
          </View>
        )}

        {data.windSpeed !== undefined && (
          <View style={styles.dataItem}>
            <Ionicons name="leaf-outline" size={16} color="#81C784" />
            <ThemedText style={styles.dataLabel}>Viento</ThemedText>
            <ThemedText style={styles.dataValue}>{data.windSpeed} km/h</ThemedText>
          </View>
        )}

        {data.airQuality !== undefined && (
          <View style={styles.dataItem}>
            <Ionicons name="leaf-outline" size={16} color={getAirQualityColor(data.airQuality)} />
            <ThemedText style={styles.dataLabel}>Calidad del aire</ThemedText>
            <ThemedText style={styles.dataValue}>{getAirQualityText(data.airQuality)}</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

function getWeatherIcon(temperature: number): keyof typeof Ionicons.glyphMap {
  if (temperature < 0) return 'snow-outline';
  if (temperature < 10) return 'cloudy-outline';
  if (temperature < 25) return 'partly-sunny-outline';
  return 'sunny-outline';
}

function getTemperatureColor(temperature: number): string {
  if (temperature < 0) return '#4FC3F7';
  if (temperature < 10) return '#81C784';
  if (temperature < 25) return '#FFB74D';
  return '#FF7043';
}

function getAirQualityColor(airQuality: number): string {
  if (airQuality < 50) return '#4CAF50';
  if (airQuality < 100) return '#FFEB3B';
  if (airQuality < 150) return '#FF9800';
  return '#F44336';
}

function getAirQualityText(airQuality: number): string {
  if (airQuality < 50) return 'Buena';
  if (airQuality < 100) return 'Moderada';
  if (airQuality < 150) return 'Insalubre';
  return 'Peligrosa';
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1C1C1E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#8E8E93',
  },
  mainData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 8,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  temperature: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  temperatureUnit: {
    fontSize: 18,
    fontWeight: '300',
    color: '#8E8E93',
    marginLeft: 4,
  },
  weatherIcon: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  dataItem: {
    alignItems: 'center',
    minWidth: 90,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  dataLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
});
