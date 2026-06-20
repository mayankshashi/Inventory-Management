from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.schemas import (
    CustomerCreate,
    CustomerResponse,
    DashboardStats,
    OrderCreate,
    OrderItemResponse,
    OrderResponse,
    PaginatedResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.services.services import CustomerService, OrderService, ProductService

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStats:
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    low_stock = ProductService.get_low_stock_products(db)
    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=[ProductResponse.model_validate(p) for p in low_stock],
    )


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db)) -> ProductResponse:
    product = ProductService.create_product(db, data)
    return ProductResponse.model_validate(product)


@router.get("/products", response_model=PaginatedResponse)
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    products, total = ProductService.list_products(db, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: UUID, db: Session = Depends(get_db)) -> ProductResponse:
    product = ProductService.get_product(db, product_id)
    return ProductResponse.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID, data: ProductUpdate, db: Session = Depends(get_db)
) -> ProductResponse:
    product = ProductService.update_product(db, product_id, data)
    return ProductResponse.model_validate(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: UUID, db: Session = Depends(get_db)) -> None:
    ProductService.delete_product(db, product_id)


@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)) -> CustomerResponse:
    customer = CustomerService.create_customer(db, data)
    return CustomerResponse.model_validate(customer)


@router.get("/customers", response_model=PaginatedResponse)
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    customers, total = CustomerService.list_customers(db, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[CustomerResponse.model_validate(c) for c in customers],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: UUID, db: Session = Depends(get_db)) -> CustomerResponse:
    customer = CustomerService.get_customer(db, customer_id)
    return CustomerResponse.model_validate(customer)


@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: UUID, db: Session = Depends(get_db)) -> None:
    CustomerService.delete_customer(db, customer_id)


def _order_to_response(order) -> OrderResponse:
    items = []
    for item in order.items:
        item_data = OrderItemResponse.model_validate(item)
        item_data.product_name = item.product.name if item.product else None
        items.append(item_data)
    response = OrderResponse.model_validate(order)
    response.customer_name = order.customer.full_name if order.customer else None
    response.items = items
    return response


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, db: Session = Depends(get_db)) -> OrderResponse:
    order = OrderService.create_order(db, data)
    order = OrderService.get_order(db, order.id)
    return _order_to_response(order)


@router.get("/orders", response_model=PaginatedResponse)
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    orders, total = OrderService.list_orders(db, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[_order_to_response(o) for o in orders],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: UUID, db: Session = Depends(get_db)) -> OrderResponse:
    order = OrderService.get_order(db, order_id)
    return _order_to_response(order)


@router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: UUID, db: Session = Depends(get_db)) -> None:
    OrderService.delete_order(db, order_id)
