from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., ge=0)
    quantity_in_stock: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    sku: str | None = Field(None, min_length=1, max_length=100)
    price: Decimal | None = Field(None, ge=0)
    quantity_in_stock: int | None = Field(None, ge=0)


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: str = Field(..., min_length=1, max_length=50)


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: UUID
    items: list[OrderItemCreate] = Field(..., min_length=1)

    @field_validator("items")
    @classmethod
    def validate_unique_products(cls, items: list[OrderItemCreate]) -> list[OrderItemCreate]:
        product_ids = [item.product_id for item in items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Duplicate products in order items are not allowed")
        return items


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    product_name: str | None = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    total_amount: Decimal
    created_at: datetime
    customer_name: str | None = None
    items: list[OrderItemResponse] = []


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductResponse]


class PaginatedResponse(BaseModel):
    items: list
    total: int
    skip: int
    limit: int
