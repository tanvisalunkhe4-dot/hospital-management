from __future__ import annotations

import re
from typing import Optional


_CANONICAL_APPOINTMENT_STATUSES = {
    "PENDING": "Pending",
    "SCHEDULED": "Scheduled",
    "CHECKEDIN": "Checked In",
    "INCONSULTATION": "In Consultation",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled",
    "CANCELED": "Cancelled",
    "CANCELLATIONREQUESTED": "Cancellation Requested",
    "RESCHEDULED": "Rescheduled",
}


def normalize_appointment_status(value: Optional[str]) -> Optional[str]:
    """
    Normalizes appointment status values to one professional, consistent format.

    Handles variants like "IN_CONSULTATION", "in consultation", "CheckedIn", etc.
    """
    if value is None:
        return None

    if not isinstance(value, str):
        value = str(value)

    raw = value.strip()
    if raw == "":
        return None

    # Convert separators to spaces and collapse whitespace.
    spaced = re.sub(r"[_\-]+", " ", raw)
    spaced = re.sub(r"\s+", " ", spaced).strip()

    # Key for canonical mapping: remove spaces, uppercase.
    key = re.sub(r"\s+", "", spaced).upper()
    if key in _CANONICAL_APPOINTMENT_STATUSES:
        return _CANONICAL_APPOINTMENT_STATUSES[key]

    # Fallback: professional casing.
    return spaced.title()

