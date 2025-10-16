const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVjZmQ0Zjg2NmNjMTQ5ZTc5ODNlZDU0OGY1NWEyYzBjIiwiaCI6Im11cm11cjY0In0=";

export const DistanceService = {
  async getRoadDistance(startLon, startLat, endLon, endLat) {
    

    try {
      // Check if coordinates are the same
      if (startLon === endLon && startLat === endLat) {
        return {
          distance: "0.0",
          duration: 0,
          durationRange: "0-5",
          success: true
        };
      }

      // Calculate straight-line distance first to check if it's too far
      const straightDistance = this.calculateStraightLineDistance(startLat, startLon, endLat, endLon);

      if (parseFloat(straightDistance) > 6000) {
        return {
          distance: null,
          duration: null,
          durationRange: null,
          success: false,
          tooFar: true
        };
      }

      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLon},${startLat}&end=${endLon},${endLat}`;
      const response = await fetch(url);

      const data = await response.json();

      // Check for API error
      if (data.error) {
        return {
          distance: null,
          duration: null,
          durationRange: null,
          success: false,
          error: data.error.message
        };
      }

      if (!data.features?.length) {
        console.error("❌ No features found in response");
        throw new Error("Invalid response - no features");
      }

      const summary = data.features[0].properties.summary;
      
      // Check if summary has distance and duration
      if (!summary || summary.distance === undefined || summary.duration === undefined) {
        console.error("❌ Invalid summary in response");
        return {
          distance: null,
          duration: null,
          durationRange: null,
          success: false
        };
      }

      const distanceKm= (summary.distance / 1000).toFixed(1); // in km
      const durationMins = Math.round(summary.duration / 60); // in minutes
      const durationRange = this.calculateDurationRange(durationMins);
      return {
        distance: distanceKm,
        duration: durationMins,
        durationRange: durationRange,
        success: true
      };
    } catch (err) {
      
      return {
        distance: null,
        duration: null,
        durationRange: null,
        success: false,
        error: err.message
      };
    }
  },

  // Calculate duration range (e.g., 10 mins -> "10-15 mins")
  calculateDurationRange(durationMins) {
    const minTime = durationMins;
    const maxTime = durationMins + 5; // Add 5 minutes buffer
    return `${minTime}-${maxTime}`;
  },

  // Calculate straight-line distance as fallback (Haversine formula)
  calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance.toFixed(1);
  },

  toRad(value) {
    return (value * Math.PI) / 180;
  }
};