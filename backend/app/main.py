"""FastAPI application entry-point."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, SessionLocal
from app.models import User
from app.routes.devices import router as devices_router
from app.routes.auth import router as auth_router
from app.services.auth_service import hash_password

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

DEFAULT_ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def _ensure_default_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == DEFAULT_ADMIN_USERNAME).first()
        if existing is None:
            admin = User(
                username=DEFAULT_ADMIN_USERNAME,
                hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
                display_name="Administrator",
                is_active=True,
                must_change_password=True,
            )
            db.add(admin)
            db.commit()
            print(f"[init] Default admin user created: {DEFAULT_ADMIN_USERNAME}")
        else:
            print(f"[init] Admin user already exists: {DEFAULT_ADMIN_USERNAME}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _ensure_default_admin()
    yield


app = FastAPI(
    title="Cyber Cap Fleet Management",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(devices_router, prefix="/api/devices", tags=["devices"])


@app.get("/health")
def health():
    return {"status": "ok"}


if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        file = STATIC_DIR / full_path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(STATIC_DIR / "index.html")
