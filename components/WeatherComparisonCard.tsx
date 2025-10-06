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

interface WeatherComparisonCardProps {
    data?: WeatherData | null;
    data1?: WeatherData;
    data2?: WeatherData;
    loading?: boolean;
    locationName?: string;
    isComparison?: boolean;
}

export default function WeatherComparisonCard({
    data,
    data1,
    data2,
    loading = false,
    locationName,
    isComparison = false
}: WeatherComparisonCardProps) {
    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ThemedText style={styles.loadingText}>Cargando datos...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    if (isComparison && data1 && data2) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.comparisonHeader}>
                    <ThemedText style={styles.comparisonTitle}>Comparación de Datos</ThemedText>
                </View>

                {/* Temperatura */}
                <View style={styles.comparisonRow}>
                    <View style={styles.comparisonHeader}>
                        <Ionicons name="thermometer" size={16} color="#FF6B35" />
                        <ThemedText style={styles.comparisonLabel}>Temperatura</ThemedText>
                    </View>
                    <View style={styles.comparisonValues}>
                        <ThemedText style={styles.comparisonValue1}>{Math.round(data1.temperature)}°C</ThemedText>
                        <ThemedText style={styles.comparisonValue2}>{Math.round(data2.temperature)}°C</ThemedText>
                        <ThemedText style={styles.comparisonDiff}>
                            {Math.round(data1.temperature - data2.temperature) > 0 ? '+' : ''}
                            {Math.round(data1.temperature - data2.temperature)}°C
                        </ThemedText>
                    </View>
                </View>

                {/* Humedad */}
                {data1.humidity !== undefined && data2.humidity !== undefined && (
                    <View style={styles.comparisonRow}>
                        <View style={styles.comparisonHeader}>
                            <Ionicons name="water" size={16} color="#64B5F6" />
                            <ThemedText style={styles.comparisonLabel}>Humedad</ThemedText>
                        </View>
                        <View style={styles.comparisonValues}>
                            <ThemedText style={styles.comparisonValue1}>{data1.humidity}%</ThemedText>
                            <ThemedText style={styles.comparisonValue2}>{data2.humidity}%</ThemedText>
                            <ThemedText style={styles.comparisonDiff}>
                                {data1.humidity - data2.humidity > 0 ? '+' : ''}
                                {data1.humidity - data2.humidity}%
                            </ThemedText>
                        </View>
                    </View>
                )}

                {/* Viento */}
                {data1.windSpeed !== undefined && data2.windSpeed !== undefined && (
                    <View style={styles.comparisonRow}>
                        <View style={styles.comparisonHeader}>
                            <Ionicons name="leaf" size={16} color="#81C784" />
                            <ThemedText style={styles.comparisonLabel}>Viento</ThemedText>
                        </View>
                        <View style={styles.comparisonValues}>
                            <ThemedText style={styles.comparisonValue1}>{data1.windSpeed} km/h</ThemedText>
                            <ThemedText style={styles.comparisonValue2}>{data2.windSpeed} km/h</ThemedText>
                            <ThemedText style={styles.comparisonDiff}>
                                {data1.windSpeed - data2.windSpeed > 0 ? '+' : ''}
                                {data1.windSpeed - data2.windSpeed} km/h
                            </ThemedText>
                        </View>
                    </View>
                )}

                {/* Calidad del aire */}
                {data1.airQuality !== undefined && data2.airQuality !== undefined && (
                    <View style={styles.comparisonRow}>
                        <View style={styles.comparisonHeader}>
                            <Ionicons name="leaf" size={16} color={getAirQualityColor(data1.airQuality)} />
                            <ThemedText style={styles.comparisonLabel}>Calidad del aire</ThemedText>
                        </View>
                        <View style={styles.comparisonValues}>
                            <ThemedText style={styles.comparisonValue1}>{getAirQualityText(data1.airQuality)}</ThemedText>
                            <ThemedText style={styles.comparisonValue2}>{getAirQualityText(data2.airQuality)}</ThemedText>
                            <ThemedText style={styles.comparisonDiff}>
                                {data1.airQuality - data2.airQuality > 0 ? '+' : ''}
                                {data1.airQuality - data2.airQuality}
                            </ThemedText>
                        </View>
                    </View>
                )}
            </ThemedView>
        );
    }

    if (!data) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cloud-outline" size={48} color="#999" />
                    <ThemedText style={styles.emptyText}>
                        {locationName ? `Datos para ${locationName}` : 'Selecciona una ubicación para ver los datos climáticos'}
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
    // Estilos para comparación

    comparisonTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    comparisonRow: {
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#2C2C2E',
        borderRadius: 8,
    },
    comparisonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    comparisonValues: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    comparisonLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
        marginLeft: 8,
        flex: 1,
    },
    comparisonValue1: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0A84FF',
        flex: 1,
        textAlign: 'center',
    },
    comparisonValue2: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34C759',
        flex: 1,
        textAlign: 'center',
    },
    comparisonDiff: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF9500',
        flex: 1,
        textAlign: 'center',
    },
});
