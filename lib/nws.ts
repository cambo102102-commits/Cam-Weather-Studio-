export type NwsPoint = {
  gridId: string;
  gridX: number;
  gridY: number;
  forecastUrl: string;
  forecastHourlyUrl: string;
  forecastGridDataUrl: string;
  city?: string;
  state?: string;
};

export type CurrentConditions = {
  temperature: number | null;
  temperatureUnit: "F";
  description: string;
  icon: string | null;
  humidity: number | null;
  windSpeed: string;
  windDirection: string;
  stationName: string;
  observedAt: string | null;
};

export type ForecastPeriod = {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend: string | null;
  probabilityOfPrecipitation: number | null;
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
};

export type NwsAlert = {
  id: string;
  event: string;
  headline: string;
  severity: string;
  urgency: string;
  certainty: string;
  areaDesc: string;
  description: string;
  instruction: string;
  onset: string | null;
  expires: string | null;
};

const NWS_BASE = "https://api.weather.gov";

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/geo+json",
};

async function nwsFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `NWS request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

function celsiusToFahrenheit(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.round((value * 9) / 5 + 32);
}

function relativeHumidity(
  temperatureC: number | null | undefined,
  dewpointC: number | null | undefined
) {
  if (
    temperatureC === null ||
    temperatureC === undefined ||
    dewpointC === null ||
    dewpointC === undefined
  ) {
    return null;
  }

  const a = 17.625;
  const b = 243.04;

  const numerator = Math.exp((a * dewpointC) / (b + dewpointC));
  const denominator = Math.exp((a * temperatureC) / (b + temperatureC));

  return Math.round((numerator / denominator) * 100);
}

function metersPerSecondToMph(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.round(value * 2.23694);
}

function degreesToCompass(degrees: number | null | undefined) {
  if (degrees === null || degrees === undefined) {
    return "";
  }

  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  const index = Math.round(degrees / 22.5) % 16;

  return directions[index];
}

export async function getNwsPoint(
  latitude: number,
  longitude: number
): Promise<NwsPoint> {
  const data = await nwsFetch<any>(
    `${NWS_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`
  );

  return {
    gridId: data.properties.gridId,
    gridX: data.properties.gridX,
    gridY: data.properties.gridY,
    forecastUrl: data.properties.forecast,
    forecastHourlyUrl: data.properties.forecastHourly,
    forecastGridDataUrl: data.properties.forecastGridData,
    city: data.properties.relativeLocation?.properties?.city,
    state: data.properties.relativeLocation?.properties?.state,
  };
}

export async function getForecast(
  latitude: number,
  longitude: number
): Promise<ForecastPeriod[]> {
  const point = await getNwsPoint(latitude, longitude);

  const data = await nwsFetch<any>(point.forecastUrl);

  return (data.properties?.periods ?? []).map((period: any) => ({
    number: period.number,
    name: period.name,
    startTime: period.startTime,
    endTime: period.endTime,
    isDaytime: period.isDaytime,
    temperature: period.temperature,
    temperatureUnit: period.temperatureUnit,
    temperatureTrend: period.temperatureTrend ?? null,
    probabilityOfPrecipitation:
      period.probabilityOfPrecipitation?.value ?? null,
    windSpeed: period.windSpeed ?? "",
    windDirection: period.windDirection ?? "",
    icon: period.icon ?? "",
    shortForecast: period.shortForecast ?? "",
    detailedForecast: period.detailedForecast ?? "",
  }));
}

export async function getHourlyForecast(
  latitude: number,
  longitude: number
): Promise<ForecastPeriod[]> {
  const point = await getNwsPoint(latitude, longitude);

  const data = await nwsFetch<any>(point.forecastHourlyUrl);

  return (data.properties?.periods ?? []).map((period: any) => ({
    number: period.number,
    name: period.name,
    startTime: period.startTime,
    endTime: period.endTime,
    isDaytime: period.isDaytime,
    temperature: period.temperature,
    temperatureUnit: period.temperatureUnit,
    temperatureTrend: period.temperatureTrend ?? null,
    probabilityOfPrecipitation:
      period.probabilityOfPrecipitation?.value ?? null,
    windSpeed: period.windSpeed ?? "",
    windDirection: period.windDirection ?? "",
    icon: period.icon ?? "",
    shortForecast: period.shortForecast ?? "",
    detailedForecast: period.detailedForecast ?? "",
  }));
}

export async function getCurrentConditions(
  latitude: number,
  longitude: number
): Promise<CurrentConditions> {
  const stations = await nwsFetch<any>(
    `${NWS_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(
      4
    )}/stations`
  );

  const station = stations.features?.[0];

  if (!station) {
    throw new Error("No NWS observation station was found.");
  }

  const stationId =
    station.properties?.stationIdentifier ??
    station.id?.split("/").pop();

  if (!stationId) {
    throw new Error("Unable to determine NWS station ID.");
  }

  const observation = await nwsFetch<any>(
    `${NWS_BASE}/stations/${stationId}/observations/latest`
  );

  const properties = observation.properties ?? {};

  const temperatureC = properties.temperature?.value ?? null;
  const dewpointC = properties.dewpoint?.value ?? null;

  const windMph = metersPerSecondToMph(properties.windSpeed?.value);

  return {
    temperature: celsiusToFahrenheit(temperatureC),
    temperatureUnit: "F",
    description:
      properties.textDescription ??
      properties.presentWeather?.[0]?.weather ??
      "Current Conditions",
    icon: properties.icon ?? null,
    humidity:
      properties.relativeHumidity?.value != null
        ? Math.round(properties.relativeHumidity.value)
        : relativeHumidity(temperatureC, dewpointC),
    windSpeed: windMph !== null ? `${windMph} mph` : "Calm",
    windDirection: degreesToCompass(properties.windDirection?.value),
    stationName: station.properties?.name ?? stationId,
    observedAt: properties.timestamp ?? null,
  };
}

export async function getActiveAlerts(
  latitude: number,
  longitude: number
): Promise<NwsAlert[]> {
  const data = await nwsFetch<any>(
    `${NWS_BASE}/alerts/active?point=${latitude.toFixed(
      4
    )},${longitude.toFixed(4)}`
  );

  return (data.features ?? []).map((feature: any) => {
    const properties = feature.properties ?? {};

    return {
      id: feature.id ?? properties.id ?? crypto.randomUUID(),
      event: properties.event ?? "Weather Alert",
      headline: properties.headline ?? properties.event ?? "Weather Alert",
      severity: properties.severity ?? "Unknown",
      urgency: properties.urgency ?? "Unknown",
      certainty: properties.certainty ?? "Unknown",
      areaDesc: properties.areaDesc ?? "",
      description: properties.description ?? "",
      instruction: properties.instruction ?? "",
      onset: properties.onset ?? properties.effective ?? null,
      expires: properties.expires ?? properties.ends ?? null,
    };
  });
}

export async function getWeatherBundle(
  latitude: number,
  longitude: number
) {
  const [point, current, forecast, hourly, alerts] = await Promise.all([
    getNwsPoint(latitude, longitude),
    getCurrentConditions(latitude, longitude),
    getForecast(latitude, longitude),
    getHourlyForecast(latitude, longitude),
    getActiveAlerts(latitude, longitude),
  ]);

  return {
    location: {
      latitude,
      longitude,
      city: point.city,
      state: point.state,
    },
    current,
    forecast,
    hourly,
    alerts,
  };
}
