"""
Database Layer for CeylonCab
- MongoDB connection management
- Schema validation
- Index creation
- CRUD operations
"""

import motor.motor_asyncio
from pymongo import IndexModel, ASCENDING, DESCENDING
from pymongo.errors import CollectionInvalid
import os
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import uuid

logger = logging.getLogger(__name__)

# Database instance
_client: Optional.AsyncIOMotorClient = None
_db: Optional.AsyncIOMotorDatabase = None


# ============ SCHEMA DEFINITIONS ============

USER_SCHEMA = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["id", "name", "email", "password", "phone", "created_at"],
        "properties": {
            "id": {"bsonType": "string", "description": "Unique user ID"},
            "name": {"bsonType": "string", "minLength": 1, "maxLength": 100},
            "email": {"bsonType": "string", "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"},
            "password": {"bsonType": "string", "minLength": 6},
            "phone": {"bsonType": "string", "minLength": 5, "maxLength": 20},
            "created_at": {"bsonType": "string"}
        }
    }
}

BOOKING_SCHEMA = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["id", "car_id", "car_name", "pickup_location", "drop_location", 
                     "pickup_date", "drop_date", "pickup_time", "distance_km", 
                     "estimated_cost", "passenger_name", "passenger_email", 
                     "passenger_phone", "status", "created_at"],
        "properties": {
            "id": {"bsonType": "string"},
            "car_id": {"bsonType": "string"},
            "car_name": {"bsonType": "string"},
            "user_id": {"bsonType": ["string", "null"]},
            "pickup_location": {"bsonType": "string"},
            "pickup_location_id": {"bsonType": "string"},
            "drop_location": {"bsonType": "string"},
            "drop_location_id": {"bsonType": "string"},
            "pickup_date": {"bsonType": "string"},
            "drop_date": {"bsonType": "string"},
            "pickup_time": {"bsonType": "string"},
            "distance_km": {"bsonType": "double"},
            "estimated_cost": {"bsonType": "double"},
            "passenger_name": {"bsonType": "string", "minLength": 1},
            "passenger_email": {"bsonType": "string"},
            "passenger_phone": {"bsonType": "string"},
            "special_requests": {"bsonType": ["string", "null"]},
            "status": {"enum": ["pending", "confirmed", "cancelled", "completed"]},
            "created_at": {"bsonType": "string"}
        }
    }
}


# ============ DATABASE CONNECTION ============

async def init_db() -> motor.AsyncIOMotorDatabase:
    """Initialize database connection, create collections with validation, and indexes."""
    global _client, _db
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        raise ValueError("MONGO_URL and DB_NAME environment variables are required")
    
    _client = motor.AsyncIOMotorClient(mongo_url)
    _db = _client[db_name]
    
    # Create collections with schema validation
    await _create_collection_with_validation("users", USER_SCHEMA)
    await _create_collection_with_validation("bookings", BOOKING_SCHEMA)
    
    # Create indexes
    await _create_indexes()
    
    logger.info(f"Database initialized: {db_name}")
    return _db


async def _create_collection_with_validation(collection_name: str, schema: dict):
    """Create collection with JSON schema validation."""
    try:
        await _db.create_collection(
            collection_name,
            validator=schema,
            validationLevel="moderate",
            validationAction="error"
        )
        logger.info(f"Created collection '{collection_name}' with schema validation")
    except CollectionInvalid:
        # Collection exists, update validation rules
        await _db.command({
            "collMod": collection_name,
            "validator": schema,
            "validationLevel": "moderate",
            "validationAction": "error"
        })
        logger.info(f"Updated schema validation for collection '{collection_name}'")


async def _create_indexes():
    """Create indexes for optimized queries."""
    # Users indexes
    user_indexes = [
        IndexModel([("id", ASCENDING)], unique=True, name="idx_user_id"),
        IndexModel([("email", ASCENDING)], unique=True, name="idx_user_email"),
    ]
    await _db.users.create_indexes(user_indexes)
    logger.info("Created indexes for 'users' collection")
    
    # Bookings indexes
    booking_indexes = [
        IndexModel([("id", ASCENDING)], unique=True, name="idx_booking_id"),
        IndexModel([("user_id", ASCENDING)], name="idx_booking_user_id"),
        IndexModel([("car_id", ASCENDING)], name="idx_booking_car_id"),
        IndexModel([("status", ASCENDING)], name="idx_booking_status"),
        IndexModel([("pickup_date", ASCENDING)], name="idx_booking_pickup_date"),
        IndexModel([("created_at", DESCENDING)], name="idx_booking_created_at"),
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="idx_booking_user_created"),
    ]
    await _db.bookings.create_indexes(booking_indexes)
    logger.info("Created indexes for 'bookings' collection")


def get_db() -> motor.AsyncIOMotorDatabase:
    """Get database instance."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _db


async def close_db():
    """Close database connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("Database connection closed")


# ============ USER OPERATIONS ============

class UserRepository:
    """Repository for user operations."""
    
    @staticmethod
    async def create(user_data: dict) -> dict:
        """Create a new user."""
        db = get_db()
        user_doc = {
            "id": str(uuid.uuid4()),
            "name": user_data["name"],
            "email": user_data["email"],
            "password": user_data["password"],
            "phone": user_data["phone"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        # Return without password and _id
        return {k: v for k, v in user_doc.items() if k not in ["password", "_id"]}
    
    @staticmethod
    async def find_by_email(email: str) -> Optional[dict]:
        """Find user by email."""
        db = get_db()
        return await db.users.find_one({"email": email}, {"_id": 0})
    
    @staticmethod
    async def find_by_id(user_id: str) -> Optional[dict]:
        """Find user by ID."""
        db = get_db()
        return await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    @staticmethod
    async def email_exists(email: str) -> bool:
        """Check if email already exists."""
        db = get_db()
        user = await db.users.find_one({"email": email}, {"_id": 1})
        return user is not None
    
    @staticmethod
    async def update(user_id: str, update_data: dict) -> bool:
        """Update user data."""
        db = get_db()
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        return result.modified_count > 0


# ============ BOOKING OPERATIONS ============

class BookingRepository:
    """Repository for booking operations."""
    
    @staticmethod
    async def create(booking_data: dict) -> dict:
        """Create a new booking."""
        db = get_db()
        booking_doc = {
            "id": str(uuid.uuid4()),
            "car_id": booking_data["car_id"],
            "car_name": booking_data["car_name"],
            "user_id": booking_data.get("user_id"),
            "pickup_location": booking_data["pickup_location"],
            "pickup_location_id": booking_data["pickup_location_id"],
            "drop_location": booking_data["drop_location"],
            "drop_location_id": booking_data["drop_location_id"],
            "pickup_date": booking_data["pickup_date"],
            "drop_date": booking_data["drop_date"],
            "pickup_time": booking_data["pickup_time"],
            "distance_km": float(booking_data["distance_km"]),
            "estimated_cost": float(booking_data["estimated_cost"]),
            "passenger_name": booking_data["passenger_name"],
            "passenger_email": booking_data["passenger_email"],
            "passenger_phone": booking_data["passenger_phone"],
            "special_requests": booking_data.get("special_requests"),
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.bookings.insert_one(booking_doc)
        # Return without _id
        return {k: v for k, v in booking_doc.items() if k != "_id"}
    
    @staticmethod
    async def find_by_id(booking_id: str) -> Optional[dict]:
        """Find booking by ID."""
        db = get_db()
        return await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    
    @staticmethod
    async def find_by_user(user_id: str, limit: int = 100) -> List[dict]:
        """Find all bookings for a user."""
        db = get_db()
        cursor = db.bookings.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
    
    @staticmethod
    async def find_all(limit: int = 100, status: Optional[str] = None) -> List[dict]:
        """Find all bookings with optional status filter."""
        db = get_db()
        query = {"status": status} if status else {}
        cursor = db.bookings.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
    
    @staticmethod
    async def update_status(booking_id: str, status: str) -> bool:
        """Update booking status."""
        db = get_db()
        result = await db.bookings.update_one(
            {"id": booking_id},
            {"$set": {"status": status}}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def delete(booking_id: str) -> bool:
        """Delete a booking."""
        db = get_db()
        result = await db.bookings.delete_one({"id": booking_id})
        return result.deleted_count > 0
    
    @staticmethod
    async def count_by_status(status: str) -> int:
        """Count bookings by status."""
        db = get_db()
        return await db.bookings.count_documents({"status": status})
    
    @staticmethod
    async def get_stats() -> dict:
        """Get booking statistics."""
        db = get_db()
        pipeline = [
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "total_revenue": {"$sum": "$estimated_cost"}
                }
            }
        ]
        cursor = db.bookings.aggregate(pipeline)
        stats = await cursor.to_list(length=10)
        return {item["_id"]: {"count": item["count"], "revenue": item["total_revenue"]} for item in stats}
