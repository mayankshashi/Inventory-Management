from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.schemas import (
    CustomerCreate,
    OrderCreate,
    ProductCreate,
    ProductUpdate,
)


class ProductService:
    @staticmethod
    def list_products(db: Session, skip: int = 0, limit: int = 100) -> tuple[list[Product], int]:
        total = db.query(func.count(Product.id)).scalar() or 0
        products = db.query(Product).order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
        return products, total

    @staticmethod
    def get_product(db: Session, product_id: UUID) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    @staticmethod
    def create_product(db: Session, data: ProductCreate) -> Product:
        product = Product(**data.model_dump())
        db.add(product)
        try:
            db.commit()
            db.refresh(product)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
        return product

    @staticmethod
    def update_product(db: Session, product_id: UUID, data: ProductUpdate) -> Product:
        product = ProductService.get_product(db, product_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        try:
            db.commit()
            db.refresh(product)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
        return product

    @staticmethod
    def delete_product(db: Session, product_id: UUID) -> None:
        product = ProductService.get_product(db, product_id)
        order_item_count = db.query(func.count(OrderItem.id)).filter(OrderItem.product_id == product_id).scalar()
        if order_item_count and order_item_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete product referenced by existing orders",
            )
        db.delete(product)
        db.commit()

    @staticmethod
    def get_low_stock_products(db: Session) -> list[Product]:
        return (
            db.query(Product)
            .filter(Product.quantity_in_stock <= settings.low_stock_threshold)
            .order_by(Product.quantity_in_stock.asc())
            .all()
        )


class CustomerService:
    @staticmethod
    def list_customers(db: Session, skip: int = 0, limit: int = 100) -> tuple[list[Customer], int]:
        total = db.query(func.count(Customer.id)).scalar() or 0
        customers = db.query(Customer).order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
        return customers, total

    @staticmethod
    def get_customer(db: Session, customer_id: UUID) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return customer

    @staticmethod
    def create_customer(db: Session, data: CustomerCreate) -> Customer:
        customer = Customer(**data.model_dump())
        db.add(customer)
        try:
            db.commit()
            db.refresh(customer)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
        return customer

    @staticmethod
    def delete_customer(db: Session, customer_id: UUID) -> None:
        customer = CustomerService.get_customer(db, customer_id)
        order_count = db.query(func.count(Order.id)).filter(Order.customer_id == customer_id).scalar()
        if order_count and order_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete customer with existing orders",
            )
        db.delete(customer)
        db.commit()


class OrderService:
    @staticmethod
    def list_orders(db: Session, skip: int = 0, limit: int = 100) -> tuple[list[Order], int]:
        total = db.query(func.count(Order.id)).scalar() or 0
        orders = (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return orders, total

    @staticmethod
    def get_order(db: Session, order_id: UUID) -> Order:
        order = (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        return order

    @staticmethod
    def create_order(db: Session, data: OrderCreate) -> Order:
        customer = CustomerService.get_customer(db, data.customer_id)

        products_map: dict[UUID, Product] = {}
        for item in data.items:
            product = ProductService.get_product(db, item.product_id)
            if product.quantity_in_stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product '{product.name}'. "
                    f"Available: {product.quantity_in_stock}, requested: {item.quantity}",
                )
            products_map[item.product_id] = product

        total_amount = sum(
            float(products_map[item.product_id].price) * item.quantity for item in data.items
        )

        order = Order(customer_id=customer.id, total_amount=total_amount)
        db.add(order)
        db.flush()

        for item in data.items:
            product = products_map[item.product_id]
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
            product.quantity_in_stock -= item.quantity
            db.add(order_item)

        try:
            db.commit()
            db.refresh(order)
        except Exception:
            db.rollback()
            raise

        return order

    @staticmethod
    def delete_order(db: Session, order_id: UUID) -> None:
        order = OrderService.get_order(db, order_id)

        for item in order.items:
            product = ProductService.get_product(db, item.product_id)
            product.quantity_in_stock += item.quantity

        db.delete(order)
        db.commit()
