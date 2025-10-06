import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import WeatherDataCard from '@/components/WeatherDataCard';
import WeatherMap from '@/components/WeatherMap';
import { NasaApiService } from '@/services/nasaApi';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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
    const router = useRouter();

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
        <SafeAreaView style={styles.safeArea}>
            <ThemedView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Barra de búsqueda */}
                    <SearchBar
                        onSearch={handleSearch}
                    />

                    {/* Botón de comparación */}
                    <TouchableOpacity
                        style={styles.comparisonButton}
                        onPress={() => router.push('/comparison')}
                    >
                        <Ionicons name="analytics" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.comparisonButtonText}>
                            Comparar Ubicaciones
                        </ThemedText>
                    </TouchableOpacity>

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
                </ScrollView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    infoContainer: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#3A3A3C',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0A84FF',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 20,
    },
    comparisonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#0A84FF',
        borderRadius: 12,
    },
    comparisonButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
});
