from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InvoiceItemBase(BaseModel):
    service_name: str
    # Kept for backward compatibility with existing invoice generation route.
    quantity: int = 1
    unit_price: float

class InvoiceCreate(BaseModel):
    patient_id: int
    hospital_id: int
    items: List[InvoiceItemBase]
    discount: float = 0.0
    tax_rate: float = 0.05 # Default 5% GST

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    patient_id: int
    hospital_id: int
    total_amount: float
    status: str
    payment_method: Optional[str] = None
    created_at: datetime
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True