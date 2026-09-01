import { NextRequest, NextResponse } from "next/server";
import {
  getActiveAlerts,
  getCurrentConditions,
  getForecast,
  getHourlyForecast,
  getNwsPoint,
} from "../../../lib/nws";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");

    // Atlanta is the default location if no coordinates are supplied.
    const latitude = latParam ? Number(latParam) : 33.749;
    const longitude = lonParam ? Number(lonParam) : -84.388;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          error: "Invalid latitude or longitude.",
        },
        { status: 400 }
      );
    }

    const point = await getNwsPoint(latitude, longitude);

    const [current, forecast, hourly, alerts] = await Promise.all([
      getCurrentConditions(latitude, longitude),
      getForecast(latitude, longitude),
      getHourlyForecast(latitude, longitude),
      getActiveAlerts(latitude, longitude),
    ]);

    return NextResponse.json({
      location: {
        latitude,
        longitude,
        city: point.city ?? null,
        state: point.state ?? null,
      },
      current,
      forecast,
      hourly,
      alerts,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Weather API error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve weather data from the National Weather Service.",
      },
      { status: 500 }
    );
  }
}
