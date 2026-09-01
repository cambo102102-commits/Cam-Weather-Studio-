"use client";

import { useMemo, useState } from "react";

type Graphic = {
  id: string;
  name: string;
  category: string;
};

const graphics: Graphic[] = [
  {
    id: "current",
    name: "Current Conditions",
    category: "Forecast"
  },
  {
    id: "today",
    name: "Today's Forecast",
    category: "Forecast"
  },
  {
    id: "seven",
    name: "7-Day Forecast",
    category: "Forecast"
  },
  {
    id: "radar",
    name: "Live Radar",
    category: "Radar"
  },
  {
    id: "warnings",
    name: "Watches & Warnings",
    category: "Severe"
  },
  {
    id: "spc",
    name: "SPC Outlook",
    category: "Severe"
  },
  {
    id: "models",
    name: "Model Viewer",
    category: "Models"
  }
];

const forecast = [
  ["MON", "89°", "68°", "Partly Cloudy"],
  ["TUE", "91°", "70°", "Scattered Storms"],
  ["WED", "88°", "67°", "Storms"],
  ["THU", "85°", "64°", "Mostly Sunny"],
  ["FRI", "86°", "65°", "Sunny"],
  ["SAT", "87°", "66°", "Partly Cloudy"],
  ["SUN", "89°", "68°", "Isolated Storm"]
];

export default function WeatherStudioShell() {
  const [activeId, setActiveId] = useState("seven");
  const [onAir, setOnAir] = useState(false);
  const [location, setLocation] = useState("Atlanta, GA");

  const activeGraphic = useMemo(() => {
    return (
      graphics.find((graphic) => graphic.id === activeId) ??
      graphics[0]
    );
  }, [activeId]);

  const nextGraphic = () => {
    const index = graphics.findIndex(
      (graphic) => graphic.id === activeId
    );

    const nextIndex = (index + 1) % graphics.length;

    setActiveId(graphics[nextIndex].id);
  };

  return (
    <main className="studio">
      <header className="topbar">
        <div>
          <div className="brand">
            CAM WEATHER STUDIO
          </div>

          <div className="subbrand">
            Broadcast Graphics Console · Prototype 0.1
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
            {new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit"
            })}
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
            onChange={(event) =>
              setLocation(event.target.value)
            }
          />

          <div className="graphicList">
            {graphics.map((graphic) => (
              <button
                key={graphic.id}
                className={
                  activeId === graphic.id
                    ? "graphicButton active"
                    : "graphicButton"
                }
                onClick={() =>
                  setActiveId(graphic.id)
                }
              >
                <span>
                  {graphic.name}
                </span>

                <small>
                  {graphic.category}
                </small>
              </button>
            ))}
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
            {activeId === "seven" ? (
              <SevenDay location={location} />
            ) : activeId === "radar" ? (
              <Placeholder
                title="LIVE RADAR"
                subtitle="MapLibre + NEXRAD layer comes next"
                location={location}
              />
            ) : activeId === "warnings" ? (
              <Placeholder
                title="WATCHES & WARNINGS"
                subtitle="NWS polygon feed comes next"
                location={location}
              />
            ) : activeId === "models" ? (
              <Placeholder
                title="MODEL VIEWER"
                subtitle="HRRR · NAM · GFS planned"
                location={location}
              />
            ) : (
              <Placeholder
                title={
                  activeGraphic.name.toUpperCase()
                }
                subtitle="Graphic template ready for live data"
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
              onClick={nextGraphic}
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
                MOCK
              </b>
            </div>

            <div className="dataRow">
              <span>Radar</span>

              <b className="offline">
                NEXT
              </b>
            </div>

            <div className="dataRow">
              <span>NWS Alerts</span>

              <b className="offline">
                NEXT
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

              <li>
                Live Radar
              </li>

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
  location
}: {
  location: string;
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

      <div className="forecastGrid">
        {forecast.map(
          ([
            day,
            high,
            low,
            condition
          ]) => (
            <div
              className="dayCard"
              key={day}
            >
              <div className="day">
                {day}
              </div>

              <div className="weatherIcon">
                {condition.includes(
                  "Storm"
                )
                  ? "⛈"
                  : condition.includes(
                      "Sunny"
                    )
                  ? "☀"
                  : "⛅"}
              </div>

              <div className="high">
                {high}
              </div>

              <div className="low">
                {low}
              </div>

              <div className="condition">
                {condition}
              </div>
            </div>
          )
        )}
      </div>

      <div className="ticker">
        Prototype forecast data · Live NWS
        data will replace this in the next
        build
      </div>
    </div>
  );
}

function Placeholder({
  title,
  subtitle,
  location
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
