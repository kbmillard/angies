"use client";

import { useState, useEffect, useMemo } from "react";
import type { ScheduleItem } from "@/lib/schedule/schema";
import { parseTimeRange } from "@/lib/admin/parse-time-range";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type ScheduleEntry = ScheduleItem;

function emptyEntry(dayOfWeek: number, featured = false): ScheduleEntry {
  return {
    id: "",
    active: true,
    dayOfWeek,
    title: "",
    locationName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    startTime: "",
    endTime: "",
    mapsUrl: "",
    lat: null,
    lng: null,
    sortOrder: 0,
    timezone: "America/Chicago",
    updatedAt: new Date().toISOString(),
    featured,
  };
}

export function WeeklyScheduleTab() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  
  // Group entries by day of week
  const entriesByDay = entries.reduce(
    (acc, entry) => {
      const day = entry.dayOfWeek ?? -1;
      if (day >= 0 && day <= 6) {
        if (!acc[day]) acc[day] = [];
        acc[day].push(entry);
      }
      return acc;
    },
    {} as Record<number, ScheduleEntry[]>
  );

  // Load schedule entries
  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedule", { credentials: "include" });
      if (!res.ok) {
        setMsg(`Failed to load: ${res.status}`);
        return;
      }
      const data = (await res.json()) as { items: ScheduleEntry[] };
      // Recurring weekly rows only (dayOfWeek, no specific date)
      const recurring = data.items.filter(
        (i) =>
          i.dayOfWeek !== undefined &&
          i.dayOfWeek !== null &&
          !i.date?.trim(),
      );
      setEntries(recurring);
      setMsg("");
    } catch (err) {
      setMsg(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveEntry(entry: ScheduleEntry) {
    const isNew = !entry.id.trim();
    const url = isNew ? "/api/admin/schedule" : `/api/admin/schedule/${entry.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        setMsg(`Save failed: ${text}`);
        return;
      }

      setMsg(isNew ? "✓ Created" : "✓ Saved");
      await loadEntries();
    } catch (err) {
      setMsg(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  async function deleteEntry(id: string) {
    if (!window.confirm("Delete this entry?")) return;

    try {
      const res = await fetch(`/api/admin/schedule/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setMsg(`Delete failed: ${res.status}`);
        return;
      }

      setMsg("✓ Deleted");
      await loadEntries();
    } catch (err) {
      setMsg(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  if (loading) {
    return <div className="text-cream/50">Loading schedule...</div>;
  }

  return (
    <div className="space-y-8">
      {msg && (
        <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-cream">
          {msg}
        </div>
      )}

      {DAYS.map((dayName, dayIndex) => (
        <DaySection
          key={dayIndex}
          dayName={dayName}
          dayIndex={dayIndex}
          entries={entriesByDay[dayIndex] || []}
          onSave={saveEntry}
          onDelete={deleteEntry}
        />
      ))}
    </div>
  );
}

type DaySectionProps = {
  dayName: string;
  dayIndex: number;
  entries: ScheduleEntry[];
  onSave: (entry: ScheduleEntry) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function DaySection({ dayName, dayIndex, entries, onSave, onDelete }: DaySectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [addingTimeForLocation, setAddingTimeForLocation] = useState<string | null>(null);

  // Group entries by location (locationName + address as key)
  const locationGroups = useMemo(() => {
    const groups = new Map<string, ScheduleEntry[]>();
    
    entries.forEach((entry) => {
      const key = `${entry.title ?? ""}|${entry.locationName}|${entry.address}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    });

    // Sort each group's times
    groups.forEach((groupEntries) => {
      groupEntries.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return Array.from(groups.entries());
  }, [entries]);

  const handleAddLocation = () => {
    setIsAddingLocation(true);
    setEditingId(null);
    setAddingTimeForLocation(null);
  };

  const handleAddTimeForLocation = (locationKey: string) => {
    setAddingTimeForLocation(locationKey);
    setEditingId(null);
    setIsAddingLocation(false);
  };

  const handleCancel = () => {
    setIsAddingLocation(false);
    setEditingId(null);
    setAddingTimeForLocation(null);
  };

  const handleSave = async (entry: ScheduleEntry) => {
    await onSave(entry);
    setIsAddingLocation(false);
    setEditingId(null);
    setAddingTimeForLocation(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-cream">{dayName}</h3>
      
      {locationGroups.length === 0 && !isAddingLocation && (
        <p className="text-sm text-cream/40">No entries for this day</p>
      )}

      {locationGroups.map(([locationKey, locationEntries]) => {
        const firstEntry = locationEntries[0]!;
        return (
          <div key={locationKey} className="ml-4 space-y-2 border-l-2 border-white/10 pl-4">
            <div className="mb-2">
              {(firstEntry.title ?? "").trim() ? (
                <p className="font-display text-base text-cream">{firstEntry.title}</p>
              ) : null}
              <p className="text-sm text-cream/80">{firstEntry.locationName}</p>
              {firstEntry.address && (
                <p className="text-xs text-cream/60">{firstEntry.address}</p>
              )}
            </div>

            {locationEntries.map((entry) =>
              editingId === entry.id ? (
                <EntryForm
                  key={entry.id}
                  initialEntry={entry}
                  dayIndex={dayIndex}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onDelete={onDelete}
                  isTimeSlotEdit
                />
              ) : (
                <TimeSlotCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => setEditingId(entry.id)}
                />
              )
            )}

            {addingTimeForLocation === locationKey && (
              <EntryForm
                initialEntry={{
                  ...emptyEntry(dayIndex, firstEntry.featured ?? false),
                  title: firstEntry.title,
                  locationName: firstEntry.locationName,
                  address: firstEntry.address,
                  city: firstEntry.city,
                  state: firstEntry.state,
                  zip: firstEntry.zip,
                  lat: firstEntry.lat,
                  lng: firstEntry.lng,
                  mapsUrl: firstEntry.mapsUrl,
                  timezone: firstEntry.timezone,
                }}
                dayIndex={dayIndex}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={onDelete}
                isTimeSlotEdit
              />
            )}

            {addingTimeForLocation !== locationKey && (
              <button
                type="button"
                onClick={() => handleAddTimeForLocation(locationKey)}
                className="text-xs text-gold hover:text-white transition-colors"
              >
                + Add time
              </button>
            )}
          </div>
        );
      })}

      {isAddingLocation && (
        <div className="ml-4">
          <EntryForm
            initialEntry={emptyEntry(dayIndex, locationGroups.length > 0)}
            dayIndex={dayIndex}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={onDelete}
          />
        </div>
      )}

      {!isAddingLocation && (
        <button
          type="button"
          onClick={handleAddLocation}
          className="text-sm text-gold hover:text-white transition-colors"
        >
          + Add location
        </button>
      )}
    </div>
  );
}

type TimeSlotCardProps = {
  entry: ScheduleEntry;
  onEdit: () => void;
};

function TimeSlotCard({ entry, onEdit }: TimeSlotCardProps) {
  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${m} ${period}`;
  };

  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left hover:border-gold/30 hover:bg-black/30 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-cream">
            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
          </span>
          {entry.featured ? (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
              Featured
            </span>
          ) : null}
        </div>
        {!entry.active && (
          <span className="text-xs text-salsa">Inactive</span>
        )}
      </div>
    </button>
  );
}

type EntryFormProps = {
  initialEntry: ScheduleEntry;
  dayIndex: number;
  onSave: (entry: ScheduleEntry) => Promise<void>;
  onCancel: () => void;
  onDelete: (id: string) => Promise<void>;
  isTimeSlotEdit?: boolean;
};

function EntryForm({ initialEntry, dayIndex, onSave, onCancel, onDelete, isTimeSlotEdit = false }: EntryFormProps) {
  const [entry, setEntry] = useState<ScheduleEntry>(initialEntry);
  const [timeInput, setTimeInput] = useState("");
  const [timeResult, setTimeResult] = useState<ReturnType<typeof parseTimeRange> | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [busy, setBusy] = useState(false);

  // Initialize time input if entry has times
  useEffect(() => {
    if (initialEntry.startTime && initialEntry.endTime) {
      const formatted = formatTimeRange(initialEntry.startTime, initialEntry.endTime);
      setTimeInput(formatted);
      const result = parseTimeRange(formatted);
      setTimeResult(result);
    }
  }, [initialEntry.startTime, initialEntry.endTime]);

  function formatTimeRange(start: string, end: string): string {
    const formatTime = (time: string) => {
      const [h, m] = time.split(":");
      const hour = parseInt(h, 10);
      const period = hour >= 12 ? "pm" : "am";
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return m === "00" ? `${hour12}${period}` : `${hour12}:${m}${period}`;
    };
    return `${formatTime(start)}-${formatTime(end)}`;
  }

  const handleTimeChange = (value: string) => {
    setTimeInput(value);
    if (value.trim()) {
      const result = parseTimeRange(value);
      setTimeResult(result);
      if (result.valid) {
        setEntry({ ...entry, startTime: result.startTime, endTime: result.endTime });
      }
    } else {
      setTimeResult(null);
    }
  };

  const handleGeocode = async () => {
    if (!entry.address.trim()) return;

    setGeocoding(true);
    try {
      const res = await fetch("/api/admin/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: entry.address }),
        credentials: "include",
      });

      if (!res.ok) {
        alert("Geocode failed");
        return;
      }

      const data = await res.json();
      if (data.ok) {
        setEntry({
          ...entry,
          lat: data.latitude,
          lng: data.longitude,
          city: data.addressComponents?.city || entry.city,
          state: data.addressComponents?.state || entry.state,
          zip: data.addressComponents?.postal_code || entry.zip,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`,
        });
      }
    } catch {
      alert("Geocode error");
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!entry.locationName.trim()) {
      alert("Location name required");
      return;
    }
    if (!entry.startTime || !entry.endTime) {
      alert("Times required");
      return;
    }

    setBusy(true);
    await onSave({ ...entry, dayOfWeek: dayIndex, date: "" });
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!entry.id) return;
    setBusy(true);
    await onDelete(entry.id);
    setBusy(false);
  };

  const inputClass =
    "w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-cream placeholder-cream/30 focus:border-gold/50 focus:outline-none";

  return (
    <div className="space-y-3 rounded-lg border border-white/15 bg-charcoal/40 p-4">
      {!isTimeSlotEdit && (
        <>
          <input
            type="text"
            placeholder="Header (e.g. Angie's Food Truck)"
            value={entry.title ?? ""}
            onChange={(e) => setEntry({ ...entry, title: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Description (location details)"
            value={entry.locationName}
            onChange={(e) => setEntry({ ...entry, locationName: e.target.value })}
            className={inputClass}
          />

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Address (paste full address)"
              value={entry.address}
              onChange={(e) => setEntry({ ...entry, address: e.target.value })}
              onBlur={handleGeocode}
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding}
              className="text-xs text-gold hover:text-white transition-colors disabled:opacity-50"
            >
              {geocoding ? "Geocoding..." : "📍 Geocode address"}
            </button>
            {entry.city && (
              <div className="text-xs text-cream/50">
                {entry.city}, {entry.state} {entry.zip}
              </div>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Hours (e.g., 10am-2pm, 10:00 AM to 2:00 PM)"
          value={timeInput}
          onChange={(e) => handleTimeChange(e.target.value)}
          className={`${inputClass} ${timeResult && !timeResult.valid ? "border-salsa" : ""}`}
        />
        {timeResult && (
          <div className={`text-xs ${timeResult.valid ? "text-accent-green" : "text-salsa"}`}>
            {timeResult.valid ? `✓ ${timeResult.displayText}` : `✗ ${timeResult.error}`}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-cream">
          <input
            type="checkbox"
            checked={entry.active}
            onChange={(e) => setEntry({ ...entry, active: e.target.checked })}
            className="rounded"
          />
          Active
        </label>
        {!isTimeSlotEdit ? (
          <label className="flex items-center gap-2 text-sm text-cream">
            <input
              type="checkbox"
              checked={entry.featured ?? false}
              onChange={(e) => setEntry({ ...entry, featured: e.target.checked })}
              className="rounded"
            />
            Featured
          </label>
        ) : null}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || (timeResult ? !timeResult.valid : false)}
          className="rounded-lg bg-salsa px-4 py-2 text-sm font-medium text-cream hover:bg-salsa/90 disabled:opacity-50 transition-colors"
        >
          {busy ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-cream hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        {entry.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="ml-auto rounded-lg border border-salsa/30 px-4 py-2 text-sm text-salsa hover:bg-salsa/10 disabled:opacity-50 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
