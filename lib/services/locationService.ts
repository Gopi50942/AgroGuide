export interface ResolvedLocation {
  lat: number;
  lng: number;
  /** GPS accuracy in meters, if the browser provided it. */
  accuracy?: number;
  /** Smallest settlement unit Nominatim returned (village/hamlet/suburb). */
  village?: string;
  /** Local self-government body — not always returned by Nominatim for India. */
  panchayat?: string;
  /** Taluk/tehsil/mandal — field name varies by state in OSM data. */
  taluk?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  displayName?: string;
  isDemo: boolean;
}

export function requestBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const error = new Error("Geolocation is not supported in this browser.");
      console.error("❌ Location error:", error);
      reject(error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Browser location:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        resolve(position);
      },
      (error) => {
        console.error("❌ Browser geolocation error:", {
          code: error.code,
          message: error.message,
        });

        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  accuracy?: number
): Promise<ResolvedLocation> {
  try {
    console.log("📍 Reverse geocoding:", { lat, lng });

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${encodeURIComponent(lat)}` +
      `&lon=${encodeURIComponent(lng)}` +
      `&addressdetails=1`;

    console.log("🌐 Nominatim URL:", url);

    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();

      console.error("❌ Nominatim HTTP error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });

      throw new Error(
        `Reverse geocoding failed: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    console.log("✅ Nominatim response:", data);

    const addr = data.address ?? {};

    // Nominatim's address field names vary by region and data source
    // quality — for rural India these are inconsistently populated, so
    // each level falls back through the closest equivalent OSM tags.
    const location: ResolvedLocation = {
      lat,
      lng,
      accuracy,
      village: addr.village || addr.hamlet || addr.suburb || undefined,
      panchayat: addr.village_block || undefined, // rarely present in OSM data for India
      taluk: addr.county || addr.state_district || addr.municipality || undefined,
      district:
        addr.state_district ||
        addr.county ||
        addr.district ||
        addr.city_district ||
        addr.town ||
        addr.city ||
        undefined,
      state: addr.state,
      pinCode: addr.postcode || undefined,
      displayName: data.display_name,
      isDemo: false,
    };

    console.log("✅ Resolved location:", location);

    return location;
  } catch (error) {
    console.error("❌ REVERSE GEOCODING FAILED:", error);

    // During debugging, keep the coordinates but mark location as demo.
    return {
      lat,
      lng,
      accuracy,
      isDemo: true,
    };
  }
}
