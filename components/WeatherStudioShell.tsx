"use client";

import { useEffect, useMemo, useState } from "react";

type Graphic = {
  id: string;
  name: string;
  category: string;
};

type ForecastPeriod = {
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

type WeatherResponse = {
  location: {
    latitude: number;
    longitude: number;
    city: string | null;
    state: string | null;
  };
  current: {
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
  forecast: ForecastPeriod[];
  hourly: ForecastPeriod[];
  alerts: unknown[];
  updatedAt: string;
};

type ForecastDay = {
  day: string;
  high: number | null;
  low: number | null;
  condition: string;
  icon: string;
  rainChance: number | null;
};

const graphics: Graphic[] = [
  {
    id: "current",
    name: "Current Conditions",
    category: "Forecast",
  },
  {
    id: "today",
    name: "Today's Forecast",
    category: "Forecast",
  },
  {
    id: "seven",
    name: "7-Day Forecast",
    category: "Forecast",
  },
  {
    id: "radar",
    name: "Live Radar",
    category: "Radar",
  },
  {
    id: "warnings",
    name: "Watches & Warnings",
    category: "Severe",
  },
  {
    id: "spc",
    name: "SPC Outlook",
    category: "Severe",
  },
  {
    id: "models",
    name: "Model Viewer",
    category: "Models",
  },
];

export default function WeatherStudioShell() {
  const [activeId, setActiveId] = useState("seven");
  const [onAir, setOnAir] = useState(false);

  const [location, setLocation] =
    useState("Atlanta, GA");

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [weatherError, setWeatherError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        setWeatherError(null);

        const response =
          await fetch("/api/weather");

        if (!response.ok) {
          throw new Error(
            `Weather request failed: ${response.status}`
          );
        }

        const data: WeatherResponse =
          await response.json();

        setWeather(data);

        if (
          data.location.city &&
          data.location.state
        ) {
          setLocation(
            `${data.location.city}, ${data.location.state}`
          );
        }
      } catch (error) {
        console.error(error);

        setWeatherError(
          "Unable to load live NWS weather data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  const activeGraphic =
    useMemo(() => {
      return (
        graphics.find(
          (graphic) =>
            graphic.id === activeId
        ) ?? graphics[0]
      );
    }, [activeId]);

  const sevenDayForecast =
    useMemo(() => {
      if (!weather) {
        return [];
      }

      return buildSevenDayForecast(
        weather.forecast
      );
    }, [weather]);

  const nextGraphic = () => {
    const index =
      graphics.findIndex(
        (graphic) =>
          graphic.id === activeId
      );

    const nextIndex =
      (index + 1) %
      graphics.length;

    setActiveId(
      graphics[nextIndex].id
    );
  };

  return (
    <main className="studio">
      <header className="topbar">
        <div>
          <div className="brand">
            CAM WEATHER STUDIO
          </div>

          <div className="subbrand">
            Broadcast Graphics Console ·
            Live NWS Prototype
          </div>
        </div>

        <div className="statusWrap">
          <div
            className={
              onAir
                ? "status live"
                : "status"
            }
          >
            {onAir
              ? "● ON AIR"
              : "● PREVIEW"}
          </div>

          <div className="clock">
            {new Date().toLocaleTimeString(
              [],
              {
                hour: "numeric",
                minute: "2-digit",
              }
            )}
          </div>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="panelTitle">
            GRAPHICS
          </div>

          <label
            className="fieldLabel"
            htmlFor="location"
          >
            Forecast location
          </label>

          <input
            id="location"
            className="locationInput"
            value={location}
            readOnly
          />

          <div className="graphicList">
            {graphics.map(
              (graphic) => (
                <button
                  key={graphic.id}
                  className={
                    activeId ===
                    graphic.id
                      ? "graphicButton active"
                      : "graphicButton"
                  }
                  onClick={() =>
                    setActiveId(
                      graphic.id
                    )
                  }
                >
                  <span>
                    {graphic.name}
                  </span>

                  <small>
                    {graphic.category}
                  </small>
                </button>
              )
            )}
          </div>
        </aside>

        <section className="center">
          <div className="previewHeader">
            <div>
              <span className="eyebrow">
                PROGRAM PREVIEW
              </span>

              <strong>
                {activeGraphic.name}
              </strong>
            </div>

            <span className="resolution">
              16:9 · 1920×1080
            </span>
          </div>

          <div className="previewFrame">
            {activeId ===
            "seven" ? (
              <SevenDay
                location={location}
                forecast={
                  sevenDayForecast
                }
                loading={loading}
                error={weatherError}
              />
            ) : activeId ===
              "current" ? (
              <CurrentConditions
                location={location}
                weather={weather}
                loading={loading}
              />
            ) : activeId ===
              "radar" ? (
              <Placeholder
                title="LIVE RADAR"
                subtitle="NEXRAD map layer comes next"
                location={location}
              />
            ) : activeId ===
              "warnings" ? (
              <Placeholder
                title="WATCHES & WARNINGS"
                subtitle="Live NWS alerts are connected and will be visualized next"
                location={location}
              />
            ) : activeId ===
              "models" ? (
              <Placeholder
                title="MODEL VIEWER"
                subtitle="HRRR · NAM · GFS planned"
                location={location}
              />
            ) : (
              <Placeholder
                title={activeGraphic.name.toUpperCase()}
                subtitle="Graphic template ready"
                location={location}
              />
            )}
          </div>

          <div className="transport">
            <button
              className="secondary"
              onClick={() =>
                setOnAir(false)
              }
            >
              PREVIEW
            </button>

            <button
              className="take"
              onClick={() =>
                setOnAir(true)
              }
            >
              TAKE
            </button>

            <button
              className="secondary"
              onClick={
                nextGraphic
              }
            >
              NEXT GRAPHIC →
            </button>
          </div>
        </section>

        <aside className="inspector">
          <div className="panelTitle">
            CONTROL
          </div>

          <div className="controlCard">
            <span className="eyebrow">
              Selected graphic
            </span>

            <strong>
              {activeGraphic.name}
            </strong>

            <small>
              {activeGraphic.category}
            </small>
          </div>

          <div className="controlCard">
            <span className="eyebrow">
              Data
            </span>

            <div className="dataRow">
              <span>Forecast</span>

              <b className="mock">
                {weather
                  ? "LIVE"
                  : "LOAD"}
              </b>
            </div>

            <div className="dataRow">
              <span>Radar</span>

              <b className="offline">
                NEXT
              </b>
            </div>

            <div className="dataRow">
              <span>
                NWS Alerts
              </span>

              <b className="mock">
                {weather
                  ? weather.alerts.length
                  : "—"}
              </b>
            </div>
          </div>

          <div className="controlCard">
            <span className="eyebrow">
              Show playlist
            </span>

            <ol className="playlist">
              <li>
                Current Conditions
              </li>

              <li>
                Today's Forecast
              </li>

              <li>Live Radar</li>

              <li>
                7-Day Forecast
              </li>
            </ol>
          </div>
        </aside>
      </section>
    </main>
  );
}

function SevenDay({
  location,
  forecast,
  loading,
  error,
}: {
  location: string;
  forecast: ForecastDay[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="graphic sevenDay">
      <div className="graphicTop">
        <div>
          <span>
            YOUR WEATHER
          </span>

          <h1>
            7-DAY FORECAST
          </h1>
        </div>

        <div className="locationTag">
          {location}
        </div>
      </div>

      {loading ? (
        <div className="placeholderCopy">
          <strong>
            LOADING NWS DATA
          </strong>

          <span>
            Retrieving live forecast...
          </span>
        </div>
      ) : error ? (
        <div className="placeholderCopy">
          <strong>
            WEATHER DATA ERROR
          </strong>

          <span>{error}</span>
        </div>
      ) : (
        <div className="forecastGrid">
          {forecast.map(
            (day) => (
              <div
                className="dayCard"
                key={day.day}
              >
                <div className="day">
                  {day.day}
                </div>

                <img
                  className="weatherIconImage"
                  src={day.icon}
                  alt={day.condition}
                />

                <div className="high">
                  {day.high !== null
                    ? `${day.high}°`
                    : "—"}
                </div>

                <div className="low">
                  {day.low !== null
                    ? `${day.low}°`
                    : "—"}
                </div>

                <div className="condition">
                  {day.condition}
                </div>

                {day.rainChance !==
                  null && (
                  <div className="rainChance">
                    💧{" "}
                    {day.rainChance}%
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      <div className="ticker">
        LIVE · National Weather Service
        forecast data
      </div>
    </div>
  );
}

function CurrentConditions({
  location,
  weather,
  loading,
}: {
  location: string;
  weather: WeatherResponse | null;
  loading: boolean;
}) {
  return (
    <div className="graphic placeholderGraphic">
      <div className="graphicTop">
        <div>
          <span>
            CURRENT WEATHER
          </span>

          <h1>
            CURRENT CONDITIONS
          </h1>
        </div>

        <div className="locationTag">
          {location}
        </div>
      </div>

      <div className="placeholderMap">
        <div className="mapGrid" />

        <div className="placeholderCopy">
          {loading ||
          !weather ? (
            <>
              <strong>
                LOADING
              </strong>

              <span>
                Retrieving observation...
              </span>
            </>
          ) : (
            <>
              <strong>
                {weather.current
                  .temperature !==
                null
                  ? `${weather.current.temperature}°`
                  : "—"}
              </strong>

              <span>
                {
                  weather.current
                    .description
                }
              </span>

              <span>
                Humidity:{" "}
                {weather.current
                  .humidity ?? "—"}
                %
              </span>

              <span>
                Wind:{" "}
                {
                  weather.current
                    .windDirection
                }{" "}
                {
                  weather.current
                    .windSpeed
                }
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Placeholder({
  title,
  subtitle,
  location,
}: {
  title: string;
  subtitle: string;
  location: string;
}) {
  return (
    <div className="graphic placeholderGraphic">
      <div className="graphicTop">
        <div>
          <span>
            CAM WEATHER STUDIO
          </span>

          <h1>
            {title}
          </h1>
        </div>

        <div className="locationTag">
          {location}
        </div>
      </div>

      <div className="placeholderMap">
        <div className="mapGrid" />

        <div className="placeholderCopy">
          <strong>
            {title}
          </strong>

          <span>
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}

function buildSevenDayForecast(
  periods: ForecastPeriod[]
): ForecastDay[] {
  const days = new Map<
    string,
    ForecastDay
  >();

  for (const period of periods) {
    const date =
      period.startTime.slice(0, 10);

    const existing =
      days.get(date);

    if (!existing) {
      days.set(date, {
        day: formatDay(
          period.startTime
        ),
        high: period.isDaytime
          ? period.temperature
          : null,
        low: period.isDaytime
          ? null
          : period.temperature,
        condition:
          period.shortForecast,
        icon: period.icon,
        rainChance:
          period.probabilityOfPrecipitation,
      });

      continue;
    }

    if (period.isDaytime) {
      existing.high =
        period.temperature;

      existing.condition =
        period.shortForecast;

      existing.icon =
        period.icon;

      existing.rainChance =
        period.probabilityOfPrecipitation;
    } else {
      existing.low =
        period.temperature;
    }
  }

  return Array.from(
    days.values()
  ).slice(0, 7);
}

function formatDay(
  dateString: string
) {
  return new Date(
    dateString
  )
    .toLocaleDateString(
      "en-US",
      {
        weekday: "short",
      }
    )
    .toUpperCase();
}
