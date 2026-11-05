// lib/weather-pure.ts - Pure weather utility functions (no storage imports, safe for tests)

export interface CurrentWeather {
  temperature_2m: number;           // actual temp in Celsius
  apparent_temperature: number;     // feels-like in Celsius
  weather_code: number;             // WMO code
  wind_speed_10m: number;           // km/h
  precipitation: number;            // mm
  is_day: 0 | 1;                   // 1 = daytime, 0 = nighttime
}

export interface DailyWeather {
  temperature_2m_max: number[];     // index 0 = today
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyWeather;
  placeName?: string;
}

export interface WmoEntry {
  label: string;
  iconName: string;
}

// Complete WMO code map - NO day/night variants (day/night only affects scene selection)
export const WMO_MAP: Record<number, WmoEntry> = {
  0:  { label: 'Clear sky',                    iconName: 'Sun' },
  1:  { label: 'Mainly clear',                 iconName: 'Sun' },
  2:  { label: 'Partly cloudy',                iconName: 'CloudSun' },
  3:  { label: 'Overcast',                     iconName: 'Cloud' },
  45: { label: 'Foggy',                        iconName: 'CloudFog' },
  48: { label: 'Icy fog',                      iconName: 'CloudFog' },
  51: { label: 'Light drizzle',                iconName: 'CloudDrizzle' },
  53: { label: 'Moderate drizzle',             iconName: 'CloudDrizzle' },
  55: { label: 'Dense drizzle',                iconName: 'CloudDrizzle' },
  56: { label: 'Freezing drizzle',             iconName: 'CloudSnow' },   // NOT CloudDrizzle
  57: { label: 'Heavy freezing drizzle',       iconName: 'CloudSnow' },   // NOT CloudDrizzle
  61: { label: 'Light rain',                   iconName: 'CloudRain' },
  63: { label: 'Moderate rain',                iconName: 'CloudRain' },
  65: { label: 'Heavy rain',                   iconName: 'CloudRain' },
  66: { label: 'Freezing rain',                iconName: 'CloudSnow' },   // NOT CloudRain
  67: { label: 'Heavy freezing rain',          iconName: 'CloudSnow' },   // NOT CloudRain
  71: { label: 'Light snow',                   iconName: 'Snowflake' },
  73: { label: 'Moderate snow',                iconName: 'Snowflake' },
  75: { label: 'Heavy snow',                   iconName: 'Snowflake' },
  77: { label: 'Snow grains',                  iconName: 'Snowflake' },
  80: { label: 'Light showers',                iconName: 'CloudRain' },
  81: { label: 'Moderate showers',             iconName: 'CloudRain' },
  82: { label: 'Violent showers',              iconName: 'CloudRain' },
  85: { label: 'Snow showers',                 iconName: 'Snowflake' },
  86: { label: 'Heavy snow showers',           iconName: 'Snowflake' },
  95: { label: 'Thunderstorm',                 iconName: 'CloudLightning' },
  96: { label: 'Thunderstorm with hail',       iconName: 'CloudLightning' },
  99: { label: 'Thunderstorm with heavy hail', iconName: 'CloudLightning' },
};

/**
 * Looks up a WMO entry by code. Takes ONE argument (no isDay).
 * Returns a fallback for unknown codes.
 */
export function getWmoEntry(code: number): WmoEntry {
  return WMO_MAP[code] ?? { label: 'Unknown', iconName: 'Cloud' };
}

// Rain codes used for advice lookups
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);

/**
 * Returns a single rule-based advice string for the current conditions.
 * Takes TWO separate arguments (not a single WeatherData object).
 * First-match rules as defined in PRD §5.
 */
export function adviceFor(current: CurrentWeather, daily: DailyWeather): string {
  const { weather_code, apparent_temperature, wind_speed_10m } = current;
  const precipProb = daily.precipitation_probability_max[0] ?? 0;

  if ([95, 96, 99].includes(weather_code)) return 'Thunderstorms around - best to stay in.';
  if ([71, 73, 75, 77, 85, 86].includes(weather_code)) return 'Snowy out there - bundle up and watch your step.';
  if (RAIN_CODES.has(weather_code) && apparent_temperature < 15) return 'Cold and rainy - grab a jacket and an umbrella.';
  if (RAIN_CODES.has(weather_code)) return "Rain's likely - take an umbrella.";
  if (apparent_temperature < 5) return 'Seriously cold - heavy coat weather.';
  if (apparent_temperature < 15) return 'A bit chilly - a light jacket will do.';
  if (apparent_temperature > 35) return 'Scorching - stay hydrated and keep to the shade.';
  if (apparent_temperature > 28) return 'Hot one today - dress light and drink water.';
  if (wind_speed_10m > 35) return 'Pretty windy - hold onto your hat.';
  if (precipProb > 60) return "Dry now, but rain's coming later - carry an umbrella.";
  return 'Nice and mild - enjoy it.';
}

/**
 * Converts Celsius to Fahrenheit, rounded to nearest integer.
 */
export function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

/**
 * Formats a temperature value with its unit suffix.
 * e.g. formatTemp(22, 'c') => "22 C" formatTemp(72, 'f') => "72 F"
 */
export function formatTemp(celsius: number, unit: 'c' | 'f'): string {
  if (unit === 'f') {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}
