from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# --- Setup ------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60 * 24),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 24, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 24 * 7, path="/")


# --- Models -----------------------------------------------------------
class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str
    role: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProductIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=4000)
    price: float = Field(gt=0)
    compare_at_price: Optional[float] = Field(default=None, ge=0)
    category: str
    subcategory: Optional[str] = None
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    stock: int = Field(default=100, ge=0)
    featured: bool = False


class ProductOut(ProductIn):
    id: str
    created_at: str


class CartItemIn(BaseModel):
    product_id: str
    size: Optional[str] = None
    color: Optional[str] = None
    quantity: int = Field(default=1, ge=1, le=99)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=99)


class ShippingAddress(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    line1: str = Field(min_length=1, max_length=200)
    line2: Optional[str] = Field(default="", max_length=200)
    city: str = Field(min_length=1, max_length=80)
    state: str = Field(default="", max_length=80)
    postal_code: str = Field(min_length=1, max_length=20)
    country: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=4, max_length=30)


class CheckoutRequest(BaseModel):
    shipping_address: ShippingAddress


# --- Auth Helper ------------------------------------------------------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# --- App --------------------------------------------------------------
app = FastAPI(title="ATELIER 44 — Fashion E-commerce")
api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"message": "ATELIER 44 API", "status": "ok"}


# --- Auth Routes ------------------------------------------------------
@api.post("/auth/register")
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name.strip(),
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {"id": user_id, "email": email, "name": doc["name"], "role": "customer", "access_token": access}


@api.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["id"], email)
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"id": user["id"], "email": email, "name": user["name"], "role": user["role"], "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}


# --- Product Routes ---------------------------------------------------
def _product_out(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    size: Optional[str] = None,
    color: Optional[str] = None,
    sort: str = "newest",
    featured: Optional[bool] = None,
    limit: int = Query(default=48, ge=1, le=200),
):
    query: dict = {}
    if category and category.lower() != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if size:
        query["sizes"] = size
    if color:
        query["colors"] = color
    if min_price is not None or max_price is not None:
        pq: dict = {}
        if min_price is not None:
            pq["$gte"] = min_price
        if max_price is not None:
            pq["$lte"] = max_price
        query["price"] = pq
    if search:
        rx = re.escape(search)
        query["$or"] = [
            {"name": {"$regex": rx, "$options": "i"}},
            {"description": {"$regex": rx, "$options": "i"}},
            {"category": {"$regex": rx, "$options": "i"}},
        ]

    sort_map = {
        "newest": [("created_at", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "name_asc": [("name", 1)],
    }
    cursor = db.products.find(query).sort(sort_map.get(sort, sort_map["newest"])).limit(limit)
    docs = [_product_out(d) for d in await cursor.to_list(length=limit)]
    return docs


@api.get("/products/categories")
async def get_categories():
    cats = await db.products.distinct("category")
    return sorted(cats)


@api.get("/products/{product_id}")
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_out(doc)


@api.post("/products")
async def create_product(payload: ProductIn, admin: dict = Depends(get_admin_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    return _product_out(doc)


@api.put("/products/{product_id}")
async def update_product(product_id: str, payload: ProductIn, admin: dict = Depends(get_admin_user)):
    result = await db.products.update_one({"id": product_id}, {"$set": payload.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"id": product_id})
    return _product_out(doc)


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# --- Cart Routes ------------------------------------------------------
async def _cart_with_products(user_id: str) -> dict:
    items = await db.cart.find({"user_id": user_id}).to_list(length=200)
    result = []
    subtotal = 0.0
    for it in items:
        it.pop("_id", None)
        product = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
        if not product:
            continue
        line_total = round(product["price"] * it["quantity"], 2)
        subtotal += line_total
        result.append({**it, "product": product, "line_total": line_total})
    subtotal = round(subtotal, 2)
    shipping = 0.0 if subtotal == 0 or subtotal >= 200 else 15.0
    total = round(subtotal + shipping, 2)
    return {"items": result, "subtotal": subtotal, "shipping": shipping, "total": total, "count": sum(i["quantity"] for i in result)}


@api.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    return await _cart_with_products(user["id"])


@api.post("/cart")
async def add_to_cart(payload: CartItemIn, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": payload.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = await db.cart.find_one({
        "user_id": user["id"],
        "product_id": payload.product_id,
        "size": payload.size,
        "color": payload.color,
    })
    if existing:
        new_qty = min(99, existing["quantity"] + payload.quantity)
        await db.cart.update_one({"id": existing["id"]}, {"$set": {"quantity": new_qty}})
    else:
        await db.cart.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "product_id": payload.product_id,
            "size": payload.size,
            "color": payload.color,
            "quantity": payload.quantity,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    return await _cart_with_products(user["id"])


@api.put("/cart/{item_id}")
async def update_cart(item_id: str, payload: CartItemUpdate, user: dict = Depends(get_current_user)):
    result = await db.cart.update_one({"id": item_id, "user_id": user["id"]}, {"$set": {"quantity": payload.quantity}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return await _cart_with_products(user["id"])


@api.delete("/cart/{item_id}")
async def delete_cart(item_id: str, user: dict = Depends(get_current_user)):
    await db.cart.delete_one({"id": item_id, "user_id": user["id"]})
    return await _cart_with_products(user["id"])


@api.delete("/cart")
async def clear_cart(user: dict = Depends(get_current_user)):
    await db.cart.delete_many({"user_id": user["id"]})
    return await _cart_with_products(user["id"])


# --- Order Routes -----------------------------------------------------
@api.post("/orders")
async def create_order(payload: CheckoutRequest, user: dict = Depends(get_current_user)):
    cart = await _cart_with_products(user["id"])
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    order_id = str(uuid.uuid4())
    order = {
        "id": order_id,
        "user_id": user["id"],
        "user_email": user["email"],
        "items": [
            {
                "product_id": i["product_id"],
                "name": i["product"]["name"],
                "image": (i["product"]["images"] or [None])[0],
                "price": i["product"]["price"],
                "size": i.get("size"),
                "color": i.get("color"),
                "quantity": i["quantity"],
                "line_total": i["line_total"],
            }
            for i in cart["items"]
        ],
        "subtotal": cart["subtotal"],
        "shipping": cart["shipping"],
        "total": cart["total"],
        "shipping_address": payload.shipping_address.model_dump(),
        "status": "confirmed",
        "payment_method": "mock",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)
    await db.cart.delete_many({"user_id": user["id"]})
    order.pop("_id", None)
    return order


@api.get("/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    docs = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return docs


@api.get("/orders/all")
async def all_orders(admin: dict = Depends(get_admin_user)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=500)
    return docs


# --- Startup ----------------------------------------------------------
SAMPLE_PRODUCTS = [
    {
        "name": "Oversized Wool Trench",
        "description": "Handcrafted double-breasted trench in dense virgin wool. Boxy silhouette, drop shoulder, tortoise buttons.",
        "price": 489.00, "compare_at_price": 620.00,
        "category": "Outerwear", "subcategory": "Coats",
        "sizes": ["XS", "S", "M", "L", "XL"], "colors": ["Camel", "Onyx"],
        "images": [
            "https://images.unsplash.com/photo-1603805752838-aa579d77da72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMGFwcGFyZWwlMjBmbGF0JTIwbGF5fGVufDB8fHx8MTc4MTg2MzQzOXww&ixlib=rb-4.1.0&q=85",
        ],
        "stock": 40, "featured": True,
    },
    {
        "name": "Structured Leather Jacket",
        "description": "Cropped biker in polished calfskin. Asymmetric zip, quilted shoulders, silver hardware.",
        "price": 720.00, "category": "Outerwear", "subcategory": "Jackets",
        "sizes": ["S", "M", "L"], "colors": ["Black", "Espresso"],
        "images": ["https://images.pexels.com/photos/1537681/pexels-photo-1537681.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
        "stock": 22, "featured": True,
    },
    {
        "name": "Ivory Crew Tee",
        "description": "Heavy-weight organic cotton crew. Boxy fit, reinforced seams. Made in Portugal.",
        "price": 68.00, "category": "Tops", "subcategory": "T-Shirts",
        "sizes": ["XS", "S", "M", "L", "XL"], "colors": ["Ivory", "Black", "Sand"],
        "images": ["https://images.unsplash.com/photo-1467043237213-65f2da53396f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMGFwcGFyZWwlMjBmbGF0JTIwbGF5fGVufDB8fHx8MTc4MTg2MzQzOXww&ixlib=rb-4.1.0&q=85"],
        "stock": 200, "featured": True,
    },
    {
        "name": "Charcoal Wool Hoodie",
        "description": "Merino-blend hoodie with kangaroo pocket. Cut for a relaxed drape.",
        "price": 245.00, "category": "Tops", "subcategory": "Sweatshirts",
        "sizes": ["S", "M", "L", "XL"], "colors": ["Charcoal", "Slate"],
        "images": ["https://images.unsplash.com/photo-1608680480325-d3ec3cdf7e60?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMGFwcGFyZWwlMjBmbGF0JTIwbGF5fGVufDB8fHx8MTc4MTg2MzQzOXww&ixlib=rb-4.1.0&q=85"],
        "stock": 55, "featured": False,
    },
    {
        "name": "Pleated Wide-Leg Trouser",
        "description": "Fluid pleated trouser in Italian gabardine. Elongated line, side adjusters.",
        "price": 295.00, "category": "Bottoms", "subcategory": "Trousers",
        "sizes": ["XS", "S", "M", "L"], "colors": ["Black", "Chalk"],
        "images": ["https://images.pexels.com/photos/9594668/pexels-photo-9594668.jpeg"],
        "stock": 60, "featured": True,
    },
    {
        "name": "Silk Slip Dress",
        "description": "Bias-cut floor length dress in double-face silk satin. Adjustable straps.",
        "price": 465.00, "category": "Dresses", "subcategory": "Evening",
        "sizes": ["XS", "S", "M", "L"], "colors": ["Champagne", "Noir"],
        "images": ["https://images.pexels.com/photos/9121191/pexels-photo-9121191.jpeg"],
        "stock": 30, "featured": True,
    },
    {
        "name": "Sculpted Leather Tote",
        "description": "Grained calfskin tote with signature architectural handles. Fits a 15-inch laptop.",
        "price": 890.00, "category": "Accessories", "subcategory": "Bags",
        "sizes": [], "colors": ["Tan", "Black"],
        "images": ["https://images.pexels.com/photos/17435382/pexels-photo-17435382.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
        "stock": 15, "featured": True,
    },
    {
        "name": "Runway Statement Dress",
        "description": "Sculptural mini in bonded jersey. From the current studio collection.",
        "price": 540.00, "category": "Dresses", "subcategory": "Statement",
        "sizes": ["XS", "S", "M"], "colors": ["Crimson", "Ink"],
        "images": ["https://images.pexels.com/photos/28609628/pexels-photo-28609628.jpeg"],
        "stock": 12, "featured": True,
    },
    {
        "name": "Menswear Cashmere Knit",
        "description": "Boxy fine-gauge cashmere sweater with rolled hem. Woven in Scotland.",
        "price": 385.00, "category": "Tops", "subcategory": "Knitwear",
        "sizes": ["S", "M", "L", "XL"], "colors": ["Ecru", "Navy", "Rust"],
        "images": ["https://images.pexels.com/photos/8346043/pexels-photo-8346043.jpeg"],
        "stock": 44, "featured": False,
    },
    {
        "name": "Chelsea Ankle Boot",
        "description": "Handmade Chelsea in polished full-grain leather with hand-stitched welts.",
        "price": 520.00, "category": "Footwear", "subcategory": "Boots",
        "sizes": ["37", "38", "39", "40", "41", "42", "43"], "colors": ["Cognac", "Black"],
        "images": ["https://images.unsplash.com/photo-1603805752838-aa579d77da72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMGFwcGFyZWwlMjBmbGF0JTIwbGF5fGVufDB8fHx8MTc4MTg2MzQzOXww&ixlib=rb-4.1.0&q=85"],
        "stock": 25, "featured": False,
    },
    {
        "name": "Denim Selvedge Jean",
        "description": "13oz Japanese selvedge, straight leg with slight taper. Chain-stitched hem.",
        "price": 225.00, "category": "Bottoms", "subcategory": "Denim",
        "sizes": ["28", "30", "32", "34", "36"], "colors": ["Indigo Raw", "Washed Black"],
        "images": ["https://images.unsplash.com/photo-1467043237213-65f2da53396f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMGFwcGFyZWwlMjBmbGF0JTIwbGF5fGVufDB8fHx8MTc4MTg2MzQzOXww&ixlib=rb-4.1.0&q=85"],
        "stock": 80, "featured": False,
    },
    {
        "name": "Architectural Sunglasses",
        "description": "Acetate frames handcrafted in Italy with polarized graphite lenses.",
        "price": 320.00, "category": "Accessories", "subcategory": "Eyewear",
        "sizes": [], "colors": ["Tortoise", "Black"],
        "images": ["https://images.pexels.com/photos/1537681/pexels-photo-1537681.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
        "stock": 40, "featured": False,
    },
]


async def seed_admin_and_products():
    # Admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@atelier.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@1234")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Studio Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})

    # Products (only if none)
    count = await db.products.count_documents({})
    if count == 0:
        for p in SAMPLE_PRODUCTS:
            doc = {**p, "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
            await db.products.insert_one(doc)

    # Indexes
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("name")


@app.on_event("startup")
async def on_startup():
    await seed_admin_and_products()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
