const apiKey =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVjZmQ0Zjg2NmNjMTQ5ZTc5ODNlZDU0OGY1NWEyYzBjIiwiaCI6Im11cm11cjY0In0=";

async function getRoadDistance(start, end) {
  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.join(
      ","
    )}&end=${end.join(",")}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.features?.length) throw new Error("Invalid response");

    const s = data.features[0].properties.summary;
  } catch (err) {
    console.error(" Error:", err.message);
  }
}

await getRoadDistance([77.209, 28.6139], [72.8777, 19.076])