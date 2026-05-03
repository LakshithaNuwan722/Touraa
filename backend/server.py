from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from math import radians, cos, sin, asin, sqrt
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'touraa-secret-key-2024')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI(title="Touraa API")

# Configure uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========== MODELS ==========

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    phone: str
    role: Optional[str] = "user"

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class Car(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    type: str  # sedan, suv, van, mini, bus, vip
    image: str
    passengers: int
    luggage: int
    ac: bool
    transmission: str
    price_per_km: float
    daily_rate: Optional[float] = None
    included_km: Optional[float] = None
    extra_km_price: Optional[float] = None
    features: List[str]
    description: str

class CarCreate(BaseModel):
    name: str
    type: str
    image: str
    passengers: int
    luggage: int
    ac: bool
    transmission: str
    price_per_km: float
    daily_rate: Optional[float] = None
    included_km: Optional[float] = None
    extra_km_price: Optional[float] = None
    features: List[str]
    description: str

class CarUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    image: Optional[str] = None
    passengers: Optional[int] = None
    luggage: Optional[int] = None
    ac: Optional[bool] = None
    transmission: Optional[str] = None
    price_per_km: Optional[float] = None
    daily_rate: Optional[float] = None
    included_km: Optional[float] = None
    extra_km_price: Optional[float] = None
    features: Optional[List[str]] = None
    description: Optional[str] = None

class Location(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    type: str  # airport, city, destination
    lat: float
    lng: float

class DistanceRequest(BaseModel):
    pickup_id: str
    drop_id: str

class DistanceResponse(BaseModel):
    distance_km: float
    estimated_cost: float
    pickup_name: str
    drop_name: str

class BookingCreate(BaseModel):
    car_id: str
    pickup_location: str
    drop_location: str
    pickup_date: str
    drop_date: str
    pickup_time: str
    passenger_name: str
    passenger_email: EmailStr
    passenger_phone: str
    distance_km: Optional[float] = 0
    special_requests: Optional[str] = None

class BookingResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    car_id: str
    car_name: str
    user_id: Optional[str]
    pickup_location: str
    drop_location: str
    pickup_date: str
    drop_date: str
    pickup_time: str
    distance_km: float
    estimated_cost: float
    passenger_name: str
    passenger_email: str
    passenger_phone: str
    special_requests: Optional[str]
    status: str
    created_at: str

class Package(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    image: str
    duration: str
    highlights: List[str]
    price_from: float
    destinations: List[str]

class PackageCreate(BaseModel):
    name: str
    description: str
    image: str
    duration: str
    highlights: List[str]
    price_from: float
    destinations: List[str]

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    duration: Optional[str] = None
    highlights: Optional[List[str]] = None
    price_from: Optional[float] = None
    destinations: Optional[List[str]] = None

class GalleryCreate(BaseModel):
    title: str
    date: str
    images: List[str]

class GalleryUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    images: Optional[List[str]] = None

class GalleryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    date: str
    images: List[str]
    created_at: str

# ========== HELPERS ==========

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: str = None) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    # Try finding in users
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        # Try finding in admins
        user = await db.admins.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if user:
            user["phone"] = user.get("phone", "0000000000")
            
    return user

async def require_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    admin = await db.admins.find_one({"id": payload["user_id"]})
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return admin

def haversine(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    """Calculate the great circle distance in kilometers between two points."""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return round(km, 2)

# ========== SEED DATA ==========

CARS_DATA = [
    {
        "id": "car-sedan-1",
        "name": "Honda Shuttle",
        "type": "sedan",
        "image": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        "passengers": 5,
        "luggage": 3,
        "ac": True,
        "transmission": "Auto",
        "price_per_km": 120,
        "features": ["AC", "Spacious Boot", "USB Charging", "Free Driver"],
        "description": "Versatile hybrid wagon perfect for families. Spacious interior with excellent fuel efficiency."
    },
    {
        "id": "car-sedan-2",
        "name": "Toyota Prius",
        "type": "sedan",
        "image": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
        "passengers": 4,
        "luggage": 3,
        "ac": True,
        "transmission": "Auto",
        "price_per_km": 120,
        "features": ["AC", "Hybrid Engine", "GPS Navigation", "Free Driver"],
        "description": "Eco-friendly hybrid sedan with excellent fuel efficiency for long journeys."
    },
    {
        "id": "car-mini-1",
        "name": "Suzuki Wagon R",
        "type": "mini",
        "image": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
        "passengers": 4,
        "luggage": 2,
        "ac": True,
        "transmission": "Auto",
        "price_per_km": 120,
        "features": ["AC", "Fuel Efficient", "Compact Size", "Free Driver"],
        "description": "Perfect compact car for city tours and short trips. Easy to navigate through traffic."
    },
    {
        "id": "car-suv-1",
        "name": "Honda Vezel",
        "type": "suv",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "passengers": 5,
        "luggage": 4,
        "ac": True,
        "transmission": "Auto",
        "price_per_km": 120,
        "features": ["Hybrid", "AC", "Spacious Interior", "Free Driver"],
        "description": "Compact SUV perfect for small groups. Great fuel economy and comfortable ride."
    },
    {
        "id": "car-van-1",
        "name": "Toyota KDH",
        "type": "van",
        "image": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        "passengers": 10,
        "luggage": 8,
        "ac": True,
        "transmission": "Manual",
        "price_per_km": 120,
        "features": ["AC", "Spacious", "Perfect for Groups", "Free Driver"],
        "description": "Best choice for large groups and families. Comfortable for long tours."
    },
    {
        "id": "car-van-2",
        "name": "DFSK Glory",
        "type": "van",
        "image": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
        "passengers": 8,
        "luggage": 6,
        "ac": True,
        "transmission": "Auto",
        "price_per_km": 120,
        "features": ["Dual AC", "USB Ports", "Comfortable Seats", "Free Driver"],
        "description": "Modern van with premium comfort for group tours and family travel."
    }
]

LOCATIONS_DATA = [
    {"id": "loc-1", "name": "Bandaranaike International Airport (CMB)", "type": "airport", "lat": 7.1808, "lng": 79.8841},
    {"id": "loc-2", "name": "Mattala Rajapaksa Airport (HRI)", "type": "airport", "lat": 6.2845, "lng": 81.1241},
    {"id": "loc-3", "name": "Colombo City", "type": "city", "lat": 6.9271, "lng": 79.8612},
    {"id": "loc-4", "name": "Kandy", "type": "city", "lat": 7.2906, "lng": 80.6337},
    {"id": "loc-5", "name": "Galle", "type": "city", "lat": 6.0535, "lng": 80.2210},
    {"id": "loc-6", "name": "Sigiriya", "type": "destination", "lat": 7.9570, "lng": 80.7603},
    {"id": "loc-7", "name": "Ella", "type": "destination", "lat": 6.8667, "lng": 81.0466},
    {"id": "loc-8", "name": "Nuwara Eliya", "type": "destination", "lat": 6.9497, "lng": 80.7891},
    {"id": "loc-9", "name": "Yala National Park", "type": "destination", "lat": 6.3725, "lng": 81.5169},
    {"id": "loc-10", "name": "Mirissa Beach", "type": "destination", "lat": 5.9483, "lng": 80.4589},
    {"id": "loc-11", "name": "Anuradhapura", "type": "destination", "lat": 8.3114, "lng": 80.4037},
    {"id": "loc-12", "name": "Trincomalee", "type": "destination", "lat": 8.5874, "lng": 81.2152},
    {"id": "loc-13", "name": "Bentota Beach", "type": "destination", "lat": 6.4213, "lng": 79.9955},
    {"id": "loc-14", "name": "Dambulla", "type": "destination", "lat": 7.8675, "lng": 80.6517},
    {"id": "loc-15", "name": "Polonnaruwa", "type": "destination", "lat": 7.9403, "lng": 81.0188}
]

PACKAGES_DATA = [
    {
        "id": "pkg-1",
        "name": "Cultural Triangle Explorer",
        "description": "Discover Sri Lanka's ancient heritage with visits to UNESCO World Heritage sites.",
        "image": "https://images.unsplash.com/photo-1685345421631-f6ed23658e09?w=800",
        "duration": "4 Days",
        "highlights": ["Sigiriya Rock Fortress", "Dambulla Cave Temple", "Polonnaruwa Ruins", "Anuradhapura"],
        "price_from": 45000,
        "destinations": ["Sigiriya", "Dambulla", "Polonnaruwa", "Anuradhapura"]
    },
    {
        "id": "pkg-2",
        "name": "Hill Country Adventure",
        "description": "Experience the breathtaking beauty of Sri Lanka's misty mountains and tea plantations.",
        "image": "https://images.unsplash.com/photo-1559372122-1a97b2d22c22?w=800",
        "duration": "3 Days",
        "highlights": ["Nine Arch Bridge", "Tea Factory Visit", "Horton Plains", "Little Adam's Peak"],
        "price_from": 35000,
        "destinations": ["Kandy", "Nuwara Eliya", "Ella"]
    },
    {
        "id": "pkg-3",
        "name": "Beach & Wildlife Safari",
        "description": "Perfect blend of relaxation on pristine beaches and thrilling wildlife encounters.",
        "image": "https://images.unsplash.com/photo-1674556275189-e78fd6223e6d?w=800",
        "duration": "5 Days",
        "highlights": ["Yala Safari", "Whale Watching", "Mirissa Beach", "Galle Fort"],
        "price_from": 55000,
        "destinations": ["Yala", "Mirissa", "Galle"]
    },
    {
        "id": "pkg-4",
        "name": "Complete Sri Lanka Tour",
        "description": "The ultimate Sri Lanka experience covering all major attractions across the island.",
        "image": "https://images.unsplash.com/photo-1559038300-07cb5d6c3d27?w=800",
        "duration": "10 Days",
        "highlights": ["All UNESCO Sites", "Wildlife Safari", "Beaches", "Hill Country", "Ancient Cities"],
        "price_from": 95000,
        "destinations": ["Colombo", "Sigiriya", "Kandy", "Ella", "Yala", "Galle"]
    }
]

# ========== AUTH ROUTES ==========

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user: UserCreate):
    email = user.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "phone": user.phone,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user.email)
    return TokenResponse(
        token=token,
        user=UserResponse(id=user_id, name=user.name, email=user.email, phone=user.phone)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    email = credentials.email.lower()
    # Try finding in users
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        # Try finding in admins
        user = await db.admins.find_one({"email": email}, {"_id": 0})
        if user:
            user["phone"] = user.get("phone", "0000000000")
            user["role"] = "admin"
            
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user["email"])
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user["id"], 
            name=user["name"], 
            email=user["email"], 
            phone=user["phone"],
            role=user.get("role", "user")
        )
    )

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(credentials: UserLogin):
    admin = await db.admins.find_one({"email": credentials.email}, {"_id": 0})
    if not admin or not verify_password(credentials.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid admin email or password")
    
    token = create_token(admin["id"], admin["email"])
    return TokenResponse(
        token=token,
        user=UserResponse(id=admin["id"], name=admin["name"], email=admin["email"], phone="0000000000")
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    # Try finding in users
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        # Try finding in admins
        user = await db.admins.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if user:
            user["phone"] = user.get("phone", "0000000000")
            user["role"] = "admin"
            
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

# ========== CARS ROUTES ==========

@api_router.get("/cars", response_model=List[Car])
async def get_cars(type: Optional[str] = None):
    query = {} if not type else {"type": type}
    cars = await db.cars.find(query, {"_id": 0}).to_list(100)
    return cars

@api_router.get("/cars/{car_id}", response_model=Car)
async def get_car(car_id: str):
    car = await db.cars.find_one({"id": car_id}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@api_router.post("/admin/cars", response_model=Car, dependencies=[Depends(require_admin)])
async def add_car(car: CarCreate):
    car_id = f"car-{uuid.uuid4().hex[:8]}"
    car_doc = car.model_dump()
    car_doc["id"] = car_id
    
    await db.cars.insert_one(car_doc)
    return car_doc

@api_router.put("/admin/cars/{car_id}", response_model=Car, dependencies=[Depends(require_admin)])
async def update_car(car_id: str, car_update: CarUpdate):
    update_data = {k: v for k, v in car_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    result = await db.cars.update_one(
        {"id": car_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
        
    updated_car = await db.cars.find_one({"id": car_id}, {"_id": 0})
    return updated_car

@api_router.delete("/admin/cars/{car_id}", dependencies=[Depends(require_admin)])
async def delete_car(car_id: str):
    result = await db.cars.delete_one({"id": car_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car deleted successfully"}

# ========== LOCATIONS ROUTES ==========

@api_router.get("/locations", response_model=List[Location])
async def get_locations(type: Optional[str] = None):
    query = {} if not type else {"type": type}
    locations = await db.locations.find(query, {"_id": 0}).to_list(100)
    return locations

@api_router.post("/locations/distance", response_model=DistanceResponse)
async def calculate_distance(request: DistanceRequest):
    pickup = await db.locations.find_one({"id": request.pickup_id})
    drop = await db.locations.find_one({"id": request.drop_id})
    
    if not pickup or not drop:
        raise HTTPException(status_code=404, detail="Location not found")
    
    distance = haversine(pickup["lng"], pickup["lat"], drop["lng"], drop["lat"])
    # Add 20% for road distance (not straight line)
    road_distance = round(distance * 1.2, 2)
    cost = round(road_distance * 120, 2)  # Rs 120 per km
    
    return DistanceResponse(
        distance_km=road_distance,
        estimated_cost=cost,
        pickup_name=pickup["name"],
        drop_name=drop["name"]
    )

# ========== BOOKINGS ROUTES ==========

@api_router.post("/bookings", response_model=BookingResponse)
async def create_booking(booking: BookingCreate, authorization: str = Header(None)):
    # Get car details
    car = await db.cars.find_one({"id": booking.car_id})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Calculate distance and cost if not provided
    road_distance = booking.distance_km
    if not road_distance:
        pickup = await db.locations.find_one({"id": booking.pickup_location}) or {"lat": 0, "lng": 0, "name": booking.pickup_location}
        drop = await db.locations.find_one({"id": booking.drop_location}) or {"lat": 0, "lng": 0, "name": booking.drop_location}
        
        if "lat" in pickup and "lat" in drop:
            distance = haversine(pickup["lng"], pickup["lat"], drop["lng"], drop["lat"])
            road_distance = round(distance * 1.2, 2)
        else:
            road_distance = 0

    cost = round(road_distance * 120, 2)
    
    # Get user if authenticated
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            payload = decode_token(token)
            user_id = payload.get("user_id")
        except:
            pass
    
    booking_id = str(uuid.uuid4())
    booking_doc = {
        "id": booking_id,
        "car_id": booking.car_id,
        "car_name": car["name"],
        "user_id": user_id,
        "pickup_location": booking.pickup_location,
        "pickup_location_id": "google-map",
        "drop_location": booking.drop_location,
        "drop_location_id": "google-map",
        "pickup_date": booking.pickup_date,
        "drop_date": booking.drop_date,
        "pickup_time": booking.pickup_time,
        "distance_km": road_distance,
        "estimated_cost": cost,
        "passenger_name": booking.passenger_name,
        "passenger_email": booking.passenger_email,
        "passenger_phone": booking.passenger_phone,
        "special_requests": booking.special_requests,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    
    return BookingResponse(**booking_doc)

@api_router.get("/bookings/user", response_model=List[BookingResponse])
async def get_user_bookings(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user_id = payload.get("user_id")
    
    bookings = await db.bookings.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return bookings

# ========== PACKAGES ROUTES ==========

@api_router.get("/packages", response_model=List[Package])
async def get_packages():
    packages = await db.packages.find({}, {"_id": 0}).to_list(100)
    return packages

@api_router.get("/packages/{package_id}", response_model=Package)
async def get_package(package_id: str):
    package = await db.packages.find_one({"id": package_id}, {"_id": 0})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package

@api_router.post("/admin/packages", response_model=Package, dependencies=[Depends(require_admin)])
async def add_package(package: PackageCreate):
    package_id = f"pkg-{uuid.uuid4().hex[:8]}"
    package_doc = package.model_dump()
    package_doc["id"] = package_id
    
    await db.packages.insert_one(package_doc)
    return package_doc

@api_router.put("/admin/packages/{package_id}", response_model=Package, dependencies=[Depends(require_admin)])
async def update_package(package_id: str, package_update: PackageUpdate):
    update_data = {k: v for k, v in package_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    result = await db.packages.update_one(
        {"id": package_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
        
    updated_package = await db.packages.find_one({"id": package_id}, {"_id": 0})
    return updated_package

@api_router.delete("/admin/packages/{package_id}", dependencies=[Depends(require_admin)])
async def delete_package(package_id: str):
    result = await db.packages.delete_one({"id": package_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"message": "Package deleted successfully"}

# ========== GALLERY ROUTES ==========

@api_router.post("/upload", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = file.filename.split('.')[-1]
    file_name = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = UPLOADS_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/uploads/{file_name}"}

@api_router.get("/galleries", response_model=List[GalleryResponse])
async def get_galleries():
    galleries = await db.galleries.find({}, {"_id": 0}).sort("date", -1).to_list(100)
    return galleries

@api_router.get("/galleries/{gallery_id}", response_model=GalleryResponse)
async def get_gallery(gallery_id: str):
    gallery = await db.galleries.find_one({"id": gallery_id}, {"_id": 0})
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    return gallery

@api_router.post("/admin/galleries", response_model=GalleryResponse, dependencies=[Depends(require_admin)])
async def add_gallery(gallery: GalleryCreate):
    gallery_id = f"gal-{uuid.uuid4().hex[:8]}"
    gallery_doc = gallery.model_dump()
    gallery_doc["id"] = gallery_id
    gallery_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.galleries.insert_one(gallery_doc)
    return gallery_doc

@api_router.put("/admin/galleries/{gallery_id}", response_model=GalleryResponse, dependencies=[Depends(require_admin)])
async def update_gallery(gallery_id: str, gallery_update: GalleryUpdate):
    update_data = {k: v for k, v in gallery_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    result = await db.galleries.update_one(
        {"id": gallery_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Gallery not found")
        
    updated_gallery = await db.galleries.find_one({"id": gallery_id}, {"_id": 0})
    return updated_gallery

@api_router.delete("/admin/galleries/{gallery_id}", dependencies=[Depends(require_admin)])
async def delete_gallery(gallery_id: str):
    result = await db.galleries.delete_one({"id": gallery_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery not found")
    return {"message": "Gallery deleted successfully"}

# ========== ADMIN DASHBOARD ROUTES ==========

@api_router.get("/admin/stats", dependencies=[Depends(require_admin)])
async def get_admin_stats():
    bookings_count = await db.bookings.count_documents({})
    users_count = await db.users.count_documents({})
    cars_count = await db.cars.count_documents({})
    
    # Calculate total revenue
    pipeline = [
        {"$match": {"status": "confirmed"}},
        {"$group": {"_id": None, "total": {"$sum": "$estimated_cost"}}}
    ]
    revenue_result = await db.bookings.aggregate(pipeline).to_list(1)
    revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Get recent bookings
    recent_bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "kpis": {
            "totalBookings": bookings_count,
            "totalUsers": users_count,
            "totalCars": cars_count,
            "totalRevenue": revenue
        },
        "recentBookings": recent_bookings
    }

@api_router.get("/admin/bookings", dependencies=[Depends(require_admin)], response_model=List[BookingResponse])
async def get_all_bookings(status: Optional[str] = None):
    query = {} if not status else {"status": status}
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.put("/admin/bookings/{booking_id}/status", dependencies=[Depends(require_admin)])
async def update_booking_status(booking_id: str, status_update: dict):
    new_status = status_update.get("status")
    if new_status not in ["pending", "confirmed", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": f"Booking status updated to {new_status}"}

@api_router.delete("/admin/bookings/{booking_id}", dependencies=[Depends(require_admin)])
async def delete_booking(booking_id: str):
    result = await db.bookings.delete_one({"id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted successfully"}

# ========== ROOT ==========

@api_router.get("/")
async def root():
    return {"message": "Welcome to CeylonCab API"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Seed data if empty
        if await db.cars.count_documents({}) == 0:
            await db.cars.insert_many(CARS_DATA)
            logger.info("Seeded cars collection")
            
        if await db.locations.count_documents({}) == 0:
            await db.locations.insert_many(LOCATIONS_DATA)
            logger.info("Seeded locations collection")
            
        if await db.packages.count_documents({}) == 0:
            await db.packages.insert_many(PACKAGES_DATA)
            logger.info("Seeded packages collection")
            
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
