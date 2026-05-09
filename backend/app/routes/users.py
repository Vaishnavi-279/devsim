from fastapi import APIRouter, Depends, HTTPException
from ..core.database import get_database
from .auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    db = get_database()
    users = await db.users.find({}, {"password": 0}).to_list(100)
    return [
        {
            "id": u["_id"],
            "name": u["name"],
            "email": u["email"],
            "role": u["role"],
            "created_at": u["created_at"]
        }
        for u in users
    ]

@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db = get_database()
    await db.users.delete_one({"_id": user_id})
    return {"message": "User deleted successfully"}