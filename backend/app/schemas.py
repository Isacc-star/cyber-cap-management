"""Pydantic request / response schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, Field


# ---------- Auth ----------

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    display_name: Optional[str] = None
    must_change_password: bool = False


class UserInfoResponse(BaseModel):
    username: str
    display_name: Optional[str] = None
    is_active: bool = True
    must_change_password: bool = False

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ---------- Detection ----------

class DetectRequest(BaseModel):
    port: str = "COM3"
    baud: int = 115200
    timeout: float = 5.0
    user: Optional[str] = None
    password: Optional[str] = None


class DetectResponse(BaseModel):
    detected: bool
    serial_id: Optional[str] = None
    device_id: Optional[str] = None
    readable_name: Optional[str] = None
    firmware_version: Optional[str] = None
    raw_output: Optional[str] = None


# ---------- Device CRUD ----------

class GenerateDeviceResponse(BaseModel):
    device_id: str
    readable_name: str


class RegisterRequest(BaseModel):
    serial_id: Optional[str] = None
    port: Optional[str] = None
    baud: int = 115200
    timeout: float = 5.0
    user: Optional[str] = None
    password: Optional[str] = None


class ProvisionRequest(BaseModel):
    port: str = "COM3"
    baud: int = 115200
    timeout: float = 5.0
    user: Optional[str] = None
    password: Optional[str] = None


class DeviceUpdate(BaseModel):
    status: Optional[str] = None
    calibration_status: Optional[str] = None
    calibration_date: Optional[datetime] = None
    firmware_version: Optional[str] = None
    notes: Optional[str] = None
    calibration: Optional[Any] = None


class DeviceResponse(BaseModel):
    device_id: str
    readable_name: str
    serial_id: Optional[str]
    registered_at: Optional[datetime]
    last_seen: Optional[datetime]
    calibration_status: str
    calibration_date: Optional[datetime]
    status: str
    firmware_version: Optional[str]
    notes: Optional[str]
    calibration: Optional[Any]

    model_config = {"from_attributes": True}


class DeviceListResponse(BaseModel):
    total: int
    devices: List[DeviceResponse]


# ---------- QR ----------

class QrDataResponse(BaseModel):
    data_url: str


# ---------- Board operations ----------

class PullCodeRequest(BaseModel):
    port: str = "COM3"
    baud: int = 115200
    timeout: float = 30.0
    user: Optional[str] = None
    password: Optional[str] = None
    branch: Optional[str] = None


class PullCodeResponse(BaseModel):
    success: bool
    message: str
    output: Optional[str] = None


class DeployScriptsRequest(BaseModel):
    port: str = "COM3"
    baud: int = 115200
    timeout: float = 60.0
    user: Optional[str] = None
    password: Optional[str] = None


class DeployScriptsResponse(BaseModel):
    success: bool
    message: str
    output: Optional[str] = None
