const CALENDAR_URL =
  "https://recollect-us.global.ssl.fastly.net/api/places/A4F6C9D2-9029-11E4-9CC0-80274B17B254/services/344/events.en.ics?client_id=02F5D3DA-32CA-11F1-87D5-976FCE9AA5C3";

function parseTrashDates(text: string): string[] {
  // Unfold RFC 5545 line continuations (lines beginning with whitespace
  // continue the previous line).
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const dates: string[] = [];
  let inEvent = false;
  for (const line of unfolded.split(/\r?\n/)) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
    } else if (line === "END:VEVENT") {
      inEvent = false;
    } else if (inEvent && line.startsWith("DTSTART")) {
      const colon = line.indexOf(":");
      if (colon < 0) continue;
      const value = line.slice(colon + 1);
      const m = value.match(/^(\d{4})(\d{2})(\d{2})/);
      if (m) dates.push(`${m[1]}-${m[2]}-${m[3]}`);
    }
  }
  return dates;
}

// Trash schedules change rarely so we cache aggressively (6 hours).
// The stale-while-revalidate quirk that affects /image.png with weather data
// doesn't matter here — a 6-hour-old trash schedule is still correct for
// today and tomorrow.
export async function fetchTrashDates(): Promise<string[]> {
  try {
    const res = await fetch(CALENDAR_URL, { next: { revalidate: 21600 } });
    if (!res.ok) return [];
    return parseTrashDates(await res.text());
  } catch {
    return [];
  }
}
