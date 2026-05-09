from fastapi import APIRouter, Depends, HTTPException
from ..core.database import get_database
from ..models.ticket import TicketCreate, TicketUpdate, TicketResponse
from .auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter()

def ticket_to_response(t):
    return {
        "id": t["_id"],
        "ticket_number": t.get("ticket_number", ""),
        "title": t.get("title", ""),
        "ticket_type": t.get("ticket_type", ""),
        "priority": t.get("priority", ""),
        "phase": t.get("phase", ""),
        "user_story": t.get("user_story", ""),
        "acceptance_criteria": t.get("acceptance_criteria", []),
        "developer_id": t.get("developer_id"),
        "assignee_id": t.get("assignee_id"),
        "qa_required": t.get("qa_required", False),
        "qa_tester_id": t.get("qa_tester_id"),
        "time_taken": t.get("time_taken"),
        "time_unit": t.get("time_unit", "hours"),
        "sprint": t.get("sprint"),
        "fix_version": t.get("fix_version"),
        "comments": t.get("comments", []),
        "activity_log": t.get("activity_log", []),
        "created_by": t.get("created_by", ""),
        "created_at": t.get("created_at", ""),
        "updated_at": t.get("updated_at", "")
    }

@router.get("/")
async def get_tickets(current_user: dict = Depends(get_current_user)):
    db = get_database()
    tickets = await db.tickets.find().to_list(500)
    return [ticket_to_response(t) for t in tickets]

@router.post("/")
async def create_ticket(ticket_data: TicketCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only Admin or Manager can create tickets")
    
    db = get_database()

    # Auto generate ticket number
    count = await db.tickets.count_documents({})
    ticket_number = f"RDS-{str(count + 1).zfill(3)}"

    ticket_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    ticket = {
        "_id": ticket_id,
        "ticket_number": ticket_number,
        **ticket_data.dict(),
        "comments": [],
        "activity_log": [
            {
                "id": str(uuid.uuid4()),
                "user_id": current_user["_id"],
                "user_name": current_user["name"],
                "action": f"Created ticket {ticket_number}",
                "created_at": now
            }
        ],
        "created_by": current_user["_id"],
        "created_at": now,
        "updated_at": now
    }

    await db.tickets.insert_one(ticket)
    return ticket_to_response(ticket)

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket_to_response(ticket)

@router.patch("/{ticket_id}")
async def update_ticket(ticket_id: str, update_data: TicketUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.utcnow().isoformat()
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}

    # Handle comment separately
    comment_text = update_dict.pop("comment", None)
    new_comments = ticket.get("comments", [])
    if comment_text:
        new_comments.append({
            "id": str(uuid.uuid4()),
            "author_id": current_user["_id"],
            "author_name": current_user["name"],
            "content": comment_text,
            "created_at": now
        })

    # Activity log
    activity_log = ticket.get("activity_log", [])
    if "phase" in update_dict:
        activity_log.append({
            "id": str(uuid.uuid4()),
            "user_id": current_user["_id"],
            "user_name": current_user["name"],
            "action": f"Moved ticket to {update_dict['phase'].replace('_', ' ').title()}",
            "created_at": now
        })

    update_dict["comments"] = new_comments
    update_dict["activity_log"] = activity_log
    update_dict["updated_at"] = now

    await db.tickets.update_one({"_id": ticket_id}, {"$set": update_dict})
    updated = await db.tickets.find_one({"_id": ticket_id})
    return ticket_to_response(updated)

@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only Admin or Manager can delete tickets")
    db = get_database()
    await db.tickets.delete_one({"_id": ticket_id})
    return {"message": "Ticket deleted successfully"}