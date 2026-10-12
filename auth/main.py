"""Service d'authentification : inscription, connexion, JWT."""
import os, time, datetime as dt
import bcrypt, jwt
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
Session = sessionmaker(engine)
Base = declarative_base()
SECRET = os.environ["JWT_SECRET"]

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

for _ in range(20):
    try:
        Base.metadata.create_all(engine); break
    except Exception:
        time.sleep(2)

app = FastAPI(title="auth")

class Creds(BaseModel):
    email: str
    password: str

def token_for(uid: int) -> str:
    exp = dt.datetime.utcnow() + dt.timedelta(days=7)
    return jwt.encode({"sub": str(uid), "exp": exp}, SECRET, algorithm="HS256")

@app.post("/register", status_code=201)
def register(c: Creds):
    email = c.email.strip().lower()
    if "@" not in email or len(c.password) < 8:
        raise HTTPException(422, "E-mail invalide ou mot de passe de moins de 8 caractères")
    with Session() as s:
        if s.query(User).filter_by(email=email).first():
            raise HTTPException(409, "Cet e-mail est déjà utilisé")
        h = bcrypt.hashpw(c.password.encode()[:72], bcrypt.gensalt()).decode()
        u = User(email=email, password_hash=h)
        s.add(u); s.commit()
        return {"token": token_for(u.id), "email": email}

@app.post("/login")
def login(c: Creds):
    email = c.email.strip().lower()
    with Session() as s:
        u = s.query(User).filter_by(email=email).first()
        if not u or not bcrypt.checkpw(c.password.encode()[:72], u.password_hash.encode()):
            raise HTTPException(401, "E-mail ou mot de passe incorrect")
        return {"token": token_for(u.id), "email": email}

@app.get("/health")
def health():
    return {"status": "ok"}
