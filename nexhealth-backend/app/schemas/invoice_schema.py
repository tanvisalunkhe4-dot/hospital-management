from locale import currency
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InvoiceItemBase(BaseModel):
    service_name: str
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
    patient_name: str
    total_amount: float
    status: str
    created_at: datetime
    patient_id: int 

    class Config:
        from_attributes = True