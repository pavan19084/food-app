const apiKey =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVjZmQ0Zjg2NmNjMTQ5ZTc5ODNlZDU0OGY1NWEyYzBjIiwiaCI6Im11cm11cjY0In0=";

export const DistanceService = {
  async getRoadDistance(startLon, startLat, endLon, endLat) {
    try {
      // Check if coordinates are the same
      if (startLon === endLon && startLat === endLat) {
        return {
          distance: "0.0",
          duration: 0,
          success: true
        };
      }

      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLon},${startLat}&end=${endLon},${endLat}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check for API error
      if (data.error) {
        return {
          distance: "0.0",
          duration: 0,
          success: true
        };
      }

      const summary = data.features[0].properties.summary;

      if (!summary || summary.distance === undefined || summary.duration === undefined) {
        console.error("❌ Invalid summary in response");
        return {
          distance: "0.0",
          duration: 0,
          success: true
        };
      }

      const distanceKm = (summary.distance / 1000).toFixed(1);
      const durationMins = Math.round(summary.duration / 60);

      return {
        distance: distanceKm,
        duration: durationMins,
        success: true
      };

    } catch (err) {
      return {
        distance: "0.0",
        duration: 0,
        success: true
      };
    }
  },
};