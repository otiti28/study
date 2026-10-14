"""Service d'étude : paquets, cartes, révision Leitner, statistiques."""
import os, time, datetime as dt
import jwt
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from sqlalchemy import (create_engine, Column, Integer, String, Text, Boolean,
                        DateTime, ForeignKey, func)
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
SessionLocal = sessionmaker(engine)
Base = declarative_base()
SECRET = os.environ["JWT_SECRET"]
BOX_DAYS = {1: 1, 2: 2, 3: 4, 4: 8, 5: 16}  # jours avant la prochaine révision
now = dt.datetime.utcnow

class Deck(Base):
    __tablename__ = "decks"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True, nullable=False)
    name = Column(String(120), nullable=False)

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"), index=True)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    box = Column(Integer, default=1)
    due_at = Column(DateTime, default=now, index=True)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    card_id = Column(Integer)
    correct = Column(Boolean)
    at = Column(DateTime, default=now, index=True)

for _ in range(20):
    try:
        Base.metadata.create_all(engine); break
    except Exception:
        time.sleep(2)

app = FastAPI(title="study")

def db():
    with SessionLocal() as s:
        yield s

def user_id(authorization: str = Header(default="")) -> int:
    try:
        return int(jwt.decode(authorization.removeprefix("Bearer "), SECRET, algorithms=["HS256"])["sub"])
    except Exception:
        raise HTTPException(401, "Non connecté")

def own_deck(s, uid, deck_id) -> Deck:
    d = s.get(Deck, deck_id)
    if not d or d.user_id != uid:
        raise HTTPException(404, "Paquet introuvable")
    return d

def own_card(s, uid, card_id) -> Card:
    c = s.get(Card, card_id)
    d = s.get(Deck, c.deck_id) if c else None
    if not d or d.user_id != uid:
        raise HTTPException(404, "Carte introuvable")
    return c

class DeckIn(BaseModel):
    name: str

class CardIn(BaseModel):
    front: str
    back: str

class ReviewIn(BaseModel):
    correct: bool

@app.get("/decks")
def list_decks(uid: int = Depends(user_id), s=Depends(db)):
    rows = (s.query(Deck, func.count(Card.id), func.count(Card.id).filter(Card.due_at <= now()))
            .outerjoin(Card).filter(Deck.user_id == uid).group_by(Deck.id).order_by(Deck.id.desc()).all())
    return [{"id": d.id, "name": d.name, "cards": n, "due": due} for d, n, due in rows]

@app.post("/decks", status_code=201)
def create_deck(b: DeckIn, uid: int = Depends(user_id), s=Depends(db)):
    if not b.name.strip():
        raise HTTPException(422, "Le nom est vide")
    d = Deck(user_id=uid, name=b.name.strip()[:120]); s.add(d); s.commit()
    return {"id": d.id, "name": d.name}

@app.put("/decks/{deck_id}")
def rename_deck(deck_id: int, b: DeckIn, uid: int = Depends(user_id), s=Depends(db)):
    d = own_deck(s, uid, deck_id); d.name = b.name.strip()[:120]; s.commit()
    return {"id": d.id, "name": d.name}

@app.delete("/decks/{deck_id}", status_code=204)
def delete_deck(deck_id: int, uid: int = Depends(user_id), s=Depends(db)):
    d = own_deck(s, uid, deck_id)
    s.query(Card).filter_by(deck_id=d.id).delete(); s.delete(d); s.commit()

@app.get("/decks/{deck_id}/cards")
def list_cards(deck_id: int, uid: int = Depends(user_id), s=Depends(db)):
    own_deck(s, uid, deck_id)
    return [{"id": c.id, "front": c.front, "back": c.back, "box": c.box}
            for c in s.query(Card).filter_by(deck_id=deck_id).order_by(Card.id.desc()).limit(200)]

@app.post("/decks/{deck_id}/cards", status_code=201)
def add_card(deck_id: int, b: CardIn, uid: int = Depends(user_id), s=Depends(db)):
    own_deck(s, uid, deck_id)
    if not b.front.strip() or not b.back.strip():
        raise HTTPException(422, "Question et réponse obligatoires")
    c = Card(deck_id=deck_id, front=b.front.strip(), back=b.back.strip()); s.add(c); s.commit()
    return {"id": c.id}

@app.put("/cards/{card_id}")
def edit_card(card_id: int, b: CardIn, uid: int = Depends(user_id), s=Depends(db)):
    c = own_card(s, uid, card_id); c.front, c.back = b.front.strip(), b.back.strip(); s.commit()
    return {"id": c.id}

@app.delete("/cards/{card_id}", status_code=204)
def delete_card(card_id: int, uid: int = Depends(user_id), s=Depends(db)):
    s.delete(own_card(s, uid, card_id)); s.commit()

@app.get("/decks/{deck_id}/review")
def due_cards(deck_id: int, uid: int = Depends(user_id), s=Depends(db)):
    own_deck(s, uid, deck_id)
    cs = s.query(Card).filter(Card.deck_id == deck_id, Card.due_at <= now()).order_by(Card.due_at).limit(30).all()
    return [{"id": c.id, "front": c.front, "back": c.back, "box": c.box} for c in cs]

@app.post("/cards/{card_id}/review")
def review(card_id: int, b: ReviewIn, uid: int = Depends(user_id), s=Depends(db)):
    c = own_card(s, uid, card_id)
    c.box = min(c.box + 1, 5) if b.correct else 1  # méthode Leitner
    c.due_at = now() + dt.timedelta(days=BOX_DAYS[c.box])
    s.add(Review(user_id=uid, card_id=c.id, correct=b.correct)); s.commit()
    return {"box": c.box, "next_in_days": BOX_DAYS[c.box]}

@app.get("/stats")
def stats(uid: int = Depends(user_id), s=Depends(db)):
    q = s.query(func.count(Review.id)).filter(Review.user_id == uid)
    total, ok = q.scalar(), q.filter(Review.correct.is_(True)).scalar()
    midnight = now().replace(hour=0, minute=0, second=0, microsecond=0)
    today = q.filter(Review.at >= midnight).scalar()
    days = {r[0] for r in s.query(func.date(Review.at)).filter(Review.user_id == uid).distinct()}
    streak, d = 0, now().date()
    if d not in days: d -= dt.timedelta(days=1)
    while d in days:
        streak += 1; d -= dt.timedelta(days=1)
    boxes = dict(s.query(Card.box, func.count(Card.id)).join(Deck).filter(Deck.user_id == uid).group_by(Card.box).all())
    return {"reviews_total": total, "reviews_today": today,
            "success_rate": round(100 * ok / total) if total else 0,
            "streak_days": streak, "boxes": {str(i): boxes.get(i, 0) for i in range(1, 6)}}

@app.get("/health")
def health():
    return {"status": "ok"}
