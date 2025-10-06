import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NasaApiService } from '@/services/nasaApi';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import WeatherComparisonCard from '../components/WeatherComparisonCard';

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

export default function ComparisonScreen() {
    const [location1, setLocation1] = useState<LocationData | null>(null);
    const [location2, setLocation2] = useState<LocationData | null>(null);
    const [weatherData1, setWeatherData1] = useState<WeatherData | null>(null);
    const [weatherData2, setWeatherData2] = useState<WeatherData | null>(null);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [activeSearch, setActiveSearch] = useState<'location1' | 'location2' | null>(null);
    const router = useRouter();

    const handleSearch = async (query: string) => {
        if (!query.trim() || !activeSearch) return;

        const setLoading = activeSearch === 'location1' ? setLoading1 : setLoading2;
        const setLocation = activeSearch === 'location1' ? setLocation1 : setLocation2;
        const setWeatherData = activeSearch === 'location1' ? setWeatherData1 : setWeatherData2;

        setLoading(true);
        try {
            // Buscar ubicación usando geocodificación
            const locations = await NasaApiService.geocodeLocation(query);

            if (locations.length === 0) {
                Alert.alert('Error', 'No se encontró la ubicación especificada');
                return;
            }

            // Usar la primera ubicación encontrada
            const location = locations[0];
            setLocation(location);

            // Obtener datos climáticos de la NASA
            const weatherData = await NasaApiService.getTemperatureData(location);
            setWeatherData(weatherData);

        } catch (error) {
            console.error('Error en búsqueda:', error);
            Alert.alert('Error', 'No se pudo obtener los datos climáticos');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationPress = async (locationType: 'location1' | 'location2') => {
        const setLoading = locationType === 'location1' ? setLoading1 : setLoading2;
        const setLocation = locationType === 'location1' ? setLocation1 : setLocation2;
        const setWeatherData = locationType === 'location1' ? setWeatherData1 : setWeatherData2;

        setLoading(true);
        try {
            // Solicitar permisos de ubicación
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permisos de ubicación',
                    'Se necesitan permisos de ubicación para obtener datos climáticos de tu área actual.'
                );
                return;
            }

            // Obtener ubicación actual
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Crear objeto de ubicación
            const currentLocation: LocationData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                name: 'Mi ubicación actual'
            };

            setLocation(currentLocation);

            // Obtener datos climáticos para la ubicación actual
            const weatherData = await NasaApiService.getTemperatureData(currentLocation);
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

    const clearLocation = (locationType: 'location1' | 'location2') => {
        if (locationType === 'location1') {
            setLocation1(null);
            setWeatherData1(null);
        } else {
            setLocation2(null);
            setWeatherData2(null);
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
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <ThemedText style={styles.title}>Comparar Ubicaciones</ThemedText>
                            <ThemedText style={styles.subtitle}>
                                Compara datos meteorológicos entre dos ubicaciones
                            </ThemedText>
                        </View>
                    </View>

                    {/* Primera ubicación */}
                    <View style={styles.locationSection}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location" size={20} color="#0A84FF" />
                            <ThemedText style={[styles.sectionTitle, { color: '#0A84FF' }]}>Ubicación 1</ThemedText>
                            {location1 && (
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#FF3B30"
                                    onPress={() => clearLocation('location1')}
                                />
                            )}
                        </View>

                        <SearchBar
                            onSearch={(query) => {
                                setActiveSearch('location1');
                                handleSearch(query);
                            }}
                            placeholder="Buscar primera ubicación..."
                        />

                        <WeatherComparisonCard
                            data={weatherData1}
                            loading={loading1}
                            locationName={location1?.name}
                        />
                    </View>

                    {/* Segunda ubicación */}
                    <View style={styles.locationSection}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location" size={20} color="#34C759" />
                            <ThemedText style={[styles.sectionTitle, { color: '#34C759' }]}>Ubicación 2</ThemedText>
                            {location2 && (
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#FF3B30"
                                    onPress={() => clearLocation('location2')}
                                />
                            )}
                        </View>

                        <SearchBar
                            onSearch={(query) => {
                                setActiveSearch('location2');
                                handleSearch(query);
                            }}
                            placeholder="Buscar segunda ubicación..."
                        />

                        <WeatherComparisonCard
                            data={weatherData2}
                            loading={loading2}
                            locationName={location2?.name}
                        />
                    </View>

                    {/* Comparación */}
                    {weatherData1 && weatherData2 && (
                        <View style={styles.comparisonSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="analytics" size={20} color="#FF9500" />
                                <ThemedText style={styles.sectionTitle}>Comparación</ThemedText>
                            </View>

                            <WeatherComparisonCard
                                data1={weatherData1}
                                data2={weatherData2}
                                isComparison={true}
                            />
                        </View>
                    )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
    locationSection: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#3A3A3C',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
        flex: 1,
    },
    comparisonSection: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#3A3A3C',
    },
});
