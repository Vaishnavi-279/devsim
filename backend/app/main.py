from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.database import connect_db, close_db
from .routes import auth, tickets, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await seed_data()
    yield
    await close_db()

app = FastAPI(title="DevSim API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "DevSim API is running! 🚀"}

async def seed_data():
    from .core.database import get_database
    from .core.security import get_password_hash
    from datetime import datetime
    import uuid

    db = get_database()

    # Seed users
    existing = await db.users.find_one({"email": "admin@devsim.com"})
    if not existing:
        users = [
            {
                "_id": str(uuid.uuid4()),
                "name": "Admin User",
                "email": "admin@devsim.com",
                "password": get_password_hash("admin123"),
                "role": "admin",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "_id": str(uuid.uuid4()),
                "name": "Dev User",
                "email": "dev@devsim.com",
                "password": get_password_hash("dev123"),
                "role": "developer",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        await db.users.insert_many(users)
        print("✅ Users seeded!")

        # Seed tickets
        admin = await db.users.find_one({"email": "admin@devsim.com"})
        dev = await db.users.find_one({"email": "dev@devsim.com"})

        tickets = [
            {
                "_id": str(uuid.uuid4()),
                "ticket_number": "RDS-001",
                "title": "Login button not working on Safari",
                "ticket_type": "bug",
                "priority": "low",
                "phase": "qa_testing",
                "user_story": "As a user I want to login so that I can access my dashboard",
                "acceptance_criteria": [
                    {"id": str(uuid.uuid4()), "text": "Login works on Safari", "completed": False}
                ],
                "developer_id": dev["_id"],
                "assignee_id": dev["_id"],
                "qa_required": True,
                "qa_tester_id": dev["_id"],
                "sprint": "Sprint 1",
                "fix_version": "v1.1",
                "comments": [], "activity_log": [],
                "created_by": admin["_id"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "_id": str(uuid.uuid4()),
                "ticket_number": "RDS-002",
                "title": "Add dark mode toggle",
                "ticket_type": "feature",
                "priority": "medium",
                "phase": "qa_testing",
                "user_story": "As a user I want dark mode so that I can work comfortably at night",
                "acceptance_criteria": [
                    {"id": str(uuid.uuid4()), "text": "Toggle switches between light and dark", "completed": False}
                ],
                "developer_id": dev["_id"],
                "assignee_id": dev["_id"],
                "qa_required": True,
                "sprint": "Sprint 1",
                "fix_version": "v1.1",
                "comments": [], "activity_log": [],
                "created_by": admin["_id"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "_id": str(uuid.uuid4()),
                "ticket_number": "RDS-003",
                "title": "User onboarding flow",
                "ticket_type": "story",
                "priority": "high",
                "phase": "analysis",
                "user_story": "As a new user I want an onboarding flow so that I understand the platform",
                "acceptance_criteria": [],
                "developer_id": dev["_id"],
                "assignee_id": dev["_id"],
                "sprint": "Sprint 1",
                "fix_version": "v1.1",
                "comments": [], "activity_log": [],
                "created_by": admin["_id"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "_id": str(uuid.uuid4()),
                "ticket_number": "RDS-004",
                "title": "Q3 Platform Migration",
                "ticket_type": "epic",
                "priority": "critical",
                "phase": "in_development",
                "user_story": "As an admin I want to migrate the platform so that we improve performance",
                "acceptance_criteria": [],
                "developer_id": dev["_id"],
                "assignee_id": dev["_id"],
                "sprint": "Sprint 1",
                "fix_version": "v1.1",
                "comments": [], "activity_log": [],
                "created_by": admin["_id"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "_id": str(uuid.uuid4()),
                "ticket_number": "RDS-005",
                "title": "Update README with setup steps",
                "ticket_type": "feature",
                "priority": "low",
                "phase": "done",
                "user_story": "As a developer I want clear README so that I can setup the project easily",
                "acceptance_criteria": [],
                "developer_id": dev["_id"],
                "assignee_id": dev["_id"],
                "sprint": "Sprint 1",
                "fix_version": "v1.1",
                "comments": [], "activity_log": [],
                "created_by": admin["_id"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        ]
        await db.tickets.insert_many(tickets)
        print("✅ Tickets seeded!")