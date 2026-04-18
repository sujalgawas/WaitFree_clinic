"""
AI Prediction Layer
===================
Generates per-patient predictions that feed the scheduling algorithm.

Design principle:
  - All functions are PURE (no side effects, no DB calls).
  - Each function returns a dict with the numeric result AND a plain-English
    explanation — critical for healthcare explainability.
  - Travel time uses Haversine + rule-based speed; a clearly-marked hook lets
    you swap in a Google Maps Distance Matrix call with zero refactoring.
"""

import math
from datetime import time as dtime
from typing import Optional


# ---------------------------------------------------------------------------
# Constants — easy to tune without touching algorithm logic
# ---------------------------------------------------------------------------

# km/h average speeds by road type
_SPEED_URBAN_KMH = 30.0
_SPEED_PEAK_KMH = 20.0   # congestion during rush hours
_SPEED_OFF_KMH = 40.0    # off-peak / late night

# Rush-hour windows (24h clock)
_MORNING_PEAK = (7, 10)   # 07:00–10:00
_EVENING_PEAK = (17, 20)  # 17:00–20:00

# Minimum travel time enforced (avoids 0-min edge cases for same-location)
_MIN_TRAVEL_MIN = 2

# Consultation base times (minutes) by doctor specialization
_CONSULT_BASE: dict[str, int] = {
    "general physician": 15,
    "general": 15,
    "cardiologist": 25,
    "dermatologist": 20,
    "orthopaedic": 25,
    "orthopedic": 25,
    "paediatrician": 20,
    "pediatrician": 20,
    "neurologist": 30,
    "gynaecologist": 25,
    "gynecologist": 25,
    "psychiatrist": 40,
    "ophthalmologist": 20,
    "ent": 20,
    "dentist": 30,
    "radiologist": 15,
    "default": 20,
}

# Symptom keyword → urgency score boost
_SYMPTOM_URGENCY: dict[str, float] = {
    "chest pain": 0.55,
    "difficulty breathing": 0.55,
    "shortness of breath": 0.50,
    "severe": 0.40,
    "unconscious": 0.60,
    "seizure": 0.60,
    "stroke": 0.65,
    "hemorrhage": 0.65,
    "trauma": 0.45,
    "fracture": 0.35,
    "high fever": 0.30,
    "fever": 0.20,
    "pain": 0.15,
    "vomiting": 0.15,
    "nausea": 0.10,
    "headache": 0.10,
    "fatigue": 0.05,
    "cough": 0.05,
    "cold": 0.03,
    "routine": -0.10,  # explicitly routine → lower urgency
    "follow-up": -0.10,
    "checkup": -0.10,
}

# Symptom keywords that extend consultation time
_SYMPTOM_EXTRA_CONSULT: dict[str, int] = {
    "chronic": 10,
    "multiple": 8,
    "complex": 8,
    "severe": 5,
    "acute": 5,
    "pain": 3,
    "follow-up": -5,
    "routine": -5,
    "checkup": -5,
}


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Straight-line distance between two GPS points using the Haversine formula.
    Returns distance in kilometres.
    """
    R = 6371.0  # Earth radius km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _get_speed_kmh(hour: int) -> float:
    """Return approximate road speed based on time of day."""
    if _MORNING_PEAK[0] <= hour < _MORNING_PEAK[1]:
        return _SPEED_PEAK_KMH
    if _EVENING_PEAK[0] <= hour < _EVENING_PEAK[1]:
        return _SPEED_PEAK_KMH
    return _SPEED_URBAN_KMH


# ---------------------------------------------------------------------------
# Public API — AI Prediction Functions
# ---------------------------------------------------------------------------

def predict_travel_time(
    patient_lat: float,
    patient_lng: float,
    clinic_lat: float,
    clinic_lng: float,
    hour_of_day: int = 9,
) -> dict:
    """
    Predict travel time from patient location to clinic.

    Parameters
    ----------
    patient_lat / patient_lng : float
        Patient's current GPS coordinates.
    clinic_lat / clinic_lng : float
        Clinic GPS coordinates.
    hour_of_day : int
        24-hour clock hour for the target departure (used for congestion estimate).

    Returns
    -------
    dict with keys:
        travel_time_min : float   — predicted travel time in minutes
        distance_km     : float   — straight-line distance
        explanation     : str     — human-readable rationale

    TODO (Maps API):
        Replace the Haversine block below with a Google Maps Distance Matrix call:
            result = maps_client.distance_matrix(
                origins=[(patient_lat, patient_lng)],
                destinations=[(clinic_lat, clinic_lng)],
                departure_time=datetime.now(),
                mode="driving"
            )
            duration_sec = result['rows'][0]['elements'][0]['duration_in_traffic']['value']
            travel_time_min = duration_sec / 60
    """
    distance_km = _haversine_km(patient_lat, patient_lng, clinic_lat, clinic_lng)
    speed_kmh = _get_speed_kmh(hour_of_day)
    travel_time_min = max(_MIN_TRAVEL_MIN, (distance_km / speed_kmh) * 60)

    # Classify time window for explanation
    if _MORNING_PEAK[0] <= hour_of_day < _MORNING_PEAK[1]:
        traffic_label = "morning peak hours (heavy traffic)"
    elif _EVENING_PEAK[0] <= hour_of_day < _EVENING_PEAK[1]:
        traffic_label = "evening peak hours (heavy traffic)"
    else:
        traffic_label = "off-peak hours (light traffic)"

    explanation = (
        f"Distance: {distance_km:.1f} km. "
        f"Estimated speed {speed_kmh:.0f} km/h ({traffic_label}). "
        f"Predicted travel time: {travel_time_min:.0f} min. "
        f"Note: straight-line estimate; actual roads may differ."
    )

    return {
        "travel_time_min": round(travel_time_min, 1),
        "distance_km": round(distance_km, 2),
        "explanation": explanation,
    }


def predict_consultation_time(
    specialization: Optional[str] = None,
    symptoms: Optional[str] = None,
    is_new_patient: bool = True,
) -> dict:
    """
    Predict how long a consultation will take for this patient.

    Parameters
    ----------
    specialization : str or None
        Doctor's specialization (lowercase expected).
    symptoms : str or None
        Free-text symptom description from the patient's record.
    is_new_patient : bool
        First-time patients take longer (history gathering).

    Returns
    -------
    dict with keys:
        consultation_time_min : int   — predicted consultation duration
        explanation           : str
    """
    spec_key = (specialization or "default").lower().strip()
    base = _CONSULT_BASE.get(spec_key, _CONSULT_BASE["default"])
    adjustments = []

    # New patient → extra history-gathering time
    extra = 0
    if is_new_patient:
        extra += 10
        adjustments.append("+10 min (first-time patient)")

    # Symptom-based adjustments
    symptom_lower = (symptoms or "").lower()
    for keyword, delta in _SYMPTOM_EXTRA_CONSULT.items():
        if keyword in symptom_lower:
            extra += delta
            sign = "+" if delta > 0 else ""
            adjustments.append(f"{sign}{delta} min ('{keyword}' symptom)")

    total = max(5, base + extra)  # minimum 5-minute slot

    adj_str = ", ".join(adjustments) if adjustments else "no adjustments"
    explanation = (
        f"Base time for '{spec_key}': {base} min. "
        f"Adjustments: {adj_str}. "
        f"Predicted total: {total} min."
    )

    return {
        "consultation_time_min": total,
        "explanation": explanation,
    }


def predict_urgency(
    is_emergency: bool = False,
    symptoms: Optional[str] = None,
    age: Optional[int] = None,
) -> dict:
    """
    Compute a 0.0–1.0 urgency score for the patient.

    Higher score → patient should be prioritised in the queue.

    Parameters
    ----------
    is_emergency : bool
        Explicit emergency flag set by patient during booking.
    symptoms : str or None
        Free-text symptoms.
    age : int or None
        Patient age in years. Children (<5) and elderly (>65) get a boost.

    Returns
    -------
    dict with keys:
        urgency_score  : float   — 0.0 (routine) to 1.0 (critical)
        urgency_label  : str     — "low" | "medium" | "high" | "critical"
        explanation    : str
    """
    contributors = []

    if is_emergency:
        score = 1.0
        contributors.append("emergency flag set (score = 1.0, all other factors overridden)")
        label = "critical"
        return {
            "urgency_score": score,
            "urgency_label": label,
            "explanation": "; ".join(contributors),
        }

    # Start from a moderate baseline
    score = 0.30
    contributors.append("baseline score: 0.30")

    # Symptom-keyword scanning
    symptom_lower = (symptoms or "").lower()
    symptom_boost = 0.0
    matched = []
    for keyword, boost in _SYMPTOM_URGENCY.items():
        if keyword in symptom_lower:
            symptom_boost += boost
            matched.append(f"'{keyword}' ({boost:+.2f})")

    if matched:
        score += symptom_boost
        contributors.append(f"symptom keywords: {', '.join(matched)}")

    # Age vulnerability factor
    if age is not None:
        if age < 5:
            score += 0.15
            contributors.append("+0.15 (infant/toddler, age < 5)")
        elif age < 12:
            score += 0.05
            contributors.append("+0.05 (child, age < 12)")
        elif age > 65:
            score += 0.10
            contributors.append("+0.10 (senior, age > 65)")

    score = max(0.0, min(1.0, score))

    if score >= 0.75:
        label = "critical"
    elif score >= 0.50:
        label = "high"
    elif score >= 0.30:
        label = "medium"
    else:
        label = "low"

    explanation = (
        f"Urgency score: {score:.2f} ({label}). "
        f"Factors: {'; '.join(contributors)}."
    )

    return {
        "urgency_score": round(score, 3),
        "urgency_label": label,
        "explanation": explanation,
    }
