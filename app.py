from fastapi import FastAPI
from authentication import router as authentication_router
from thoughts import router as thoughts_router
from fastapi.middleware.cors import CORSMiddleware
from is_admin import router as admin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(thoughts_router)
app.include_router(authentication_router)
app.include_router(admin_router)
