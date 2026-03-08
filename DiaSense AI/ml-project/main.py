from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import json
import random
import pandas as pd
import numpy as np
import base64
import cv2
import tensorflow as tf

app = FastAPI(title="DiaSense ML Service", version="1.7")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Paths ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DIABETES_MODEL_PATH = os.path.join(BASE_DIR, "models", "diabetes_model01.pkl")
CHATBOT_MODEL_PATH = os.path.join(BASE_DIR, "artifacts", "chatbot_intent_model.pkl")
RESPONSES_PATH = os.path.join(BASE_DIR, "responses.json")
WOUND_MODEL_PATH = os.path.join(BASE_DIR, "models", "wound_unet_best.keras")

CHATBOT_FALLBACK_THRESHOLD = 0.20

# ---------------- Load models/data ----------------
try:
    diabetes_model = joblib.load(DIABETES_MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load diabetes model at {DIABETES_MODEL_PATH}. Error: {e}")

try:
    chatbot_model = joblib.load(CHATBOT_MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load chatbot model at {CHATBOT_MODEL_PATH}. Error: {e}")

try:
    with open(RESPONSES_PATH, "r", encoding="utf-8") as f:
        RESPONSES = json.load(f)
except Exception as e:
    raise RuntimeError(f"Failed to load responses.json at {RESPONSES_PATH}. Error: {e}")

wound_model = None


def get_wound_model():
    global wound_model
    if wound_model is None:
        if not os.path.exists(WOUND_MODEL_PATH):
            raise RuntimeError(f"Wound model not found at {WOUND_MODEL_PATH}")
        wound_model = tf.keras.models.load_model(WOUND_MODEL_PATH, compile=False)
    return wound_model


# ---------------- Helpers (Diabetes) ----------------
EXPECTED_COLS_FALLBACK = [
    "Gender",
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]


def unwrap_estimator(m):
    if hasattr(m, "estimator") and m.estimator is not None:
        return m.estimator
    if hasattr(m, "base_estimator") and m.base_estimator is not None:
        return m.base_estimator
    return m


def try_get_feature_names(m):
    m2 = unwrap_estimator(m)

    if hasattr(m2, "feature_names_in_"):
        return list(m2.feature_names_in_)

    if hasattr(m2, "named_steps"):
        for step in m2.named_steps.values():
            if hasattr(step, "feature_names_in_"):
                return list(step.feature_names_in_)

    return None


def get_expected_feature_count(m):
    m2 = unwrap_estimator(m)

    if hasattr(m2, "n_features_in_"):
        return int(m2.n_features_in_)

    if hasattr(m2, "named_steps"):
        last = list(m2.named_steps.values())[-1]
        if hasattr(last, "n_features_in_"):
            return int(last.n_features_in_)

    return None


def infer_gender_should_be_string(m):
    try:
        pipeline = unwrap_estimator(m)
        if not hasattr(pipeline, "named_steps"):
            return False

        ct = None
        for step in pipeline.named_steps.values():
            if step.__class__.__name__ == "ColumnTransformer":
                ct = step
                break
        if ct is None:
            return False

        transformers = getattr(ct, "transformers_", None) or getattr(ct, "transformers", None)
        if not transformers:
            return False

        for (_name, transformer, cols) in transformers:
            if cols is None:
                continue
            if not isinstance(cols, (list, tuple, np.ndarray)):
                continue

            cols_list = list(cols)
            if "Gender" in cols_list or "gender" in cols_list:
                tname = transformer.__class__.__name__
                if tname == "OneHotEncoder":
                    return True
                if tname == "Pipeline" and hasattr(transformer, "steps"):
                    for (_sname, st) in transformer.steps:
                        if st.__class__.__name__ == "OneHotEncoder":
                            return True

        return False
    except Exception:
        return False


def safe_float(x, field_name: str):
    try:
        v = float(x)
        if np.isnan(v) or np.isinf(v):
            raise ValueError
        return v
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid value for '{field_name}'")


def try_get_classes(m):
    try:
        if hasattr(m, "classes_"):
            return list(m.classes_)
        m2 = unwrap_estimator(m)
        if hasattr(m2, "classes_"):
            return list(m2.classes_)
        if hasattr(m2, "named_steps"):
            last = list(m2.named_steps.values())[-1]
            if hasattr(last, "classes_"):
                return list(last.classes_)
    except Exception:
        pass
    return None


def get_positive_class_index(classes):
    if not classes:
        return 1

    if 1 in classes:
        return classes.index(1)
    if "1" in classes:
        return classes.index("1")
    if True in classes:
        return classes.index(True)
    if "Diabetic" in classes:
        return classes.index("Diabetic")
    if "diabetic" in classes:
        return classes.index("diabetic")
    if "Positive" in classes:
        return classes.index("Positive")
    if "positive" in classes:
        return classes.index("positive")

    if len(classes) == 2:
        return 1

    return 0


# ---------------- Helpers (Chatbot) ----------------
def normalize_chat_text(text: str) -> str:
    t = (text or "").strip().lower()

    replacements = {
        "alc": "a1c",
        "a 1 c": "a1c",
        "blood sugar test": "blood sugar testing",
        "book doctor": "book a doctor",
        "cancel booking": "cancel appointment",
        "log in": "login",
        "sign in": "login",
    }

    for old, new in replacements.items():
        t = t.replace(old, new)

    return " ".join(t.split())


def get_chatbot_classes(model):
    if hasattr(model, "classes_"):
        return list(model.classes_)
    if hasattr(model, "named_steps") and "clf" in model.named_steps:
        clf = model.named_steps["clf"]
        if hasattr(clf, "classes_"):
            return list(clf.classes_)
    raise ValueError("Could not read chatbot model classes")


# ---------------- Request Schemas ----------------
class PredictRequest(BaseModel):
    gender: str
    pregnancies: float = 0
    glucose: float
    bloodPressure: float
    skinThickness: float = 0
    insulin: float = 0
    bmi: float
    diabetesPedigree: float = 0
    age: float


class ChatRequest(BaseModel):
    message: str


# ---------------- Optional: favicon ----------------
@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)


# ---------------- Startup check ----------------
@app.on_event("startup")
def _startup_check():
    pass


# ---------------- Endpoints ----------------
@app.get("/health")
def health():
    expected_cols = try_get_feature_names(diabetes_model) or EXPECTED_COLS_FALLBACK
    gender_as_string = infer_gender_should_be_string(diabetes_model)
    classes = try_get_classes(diabetes_model)

    wound_loaded = os.path.exists(WOUND_MODEL_PATH)

    return {
        "status": "ok",
        "diabetes_model_loaded": True,
        "chatbot_model_loaded": True,
        "wound_model_exists": wound_loaded,
        "diabetes_model_path": DIABETES_MODEL_PATH,
        "chatbot_model_path": CHATBOT_MODEL_PATH,
        "wound_model_path": WOUND_MODEL_PATH,
        "responses_path": RESPONSES_PATH,
        "diabetes_model_type": str(type(diabetes_model)),
        "expected_feature_count": get_expected_feature_count(diabetes_model),
        "expected_columns": expected_cols,
        "gender_mode": "string(male/female)" if gender_as_string else "numeric(male=1,female=0)",
        "classes": classes,
        "positive_class_index": get_positive_class_index(classes),
        "chatbot_fallback_threshold": CHATBOT_FALLBACK_THRESHOLD,
    }


@app.post("/predict")
def predict(req: PredictRequest):
    g = (req.gender or "").strip().lower()
    if g not in ("male", "female"):
        raise HTTPException(status_code=400, detail="gender must be 'male' or 'female'")

    expected_cols = try_get_feature_names(diabetes_model) or EXPECTED_COLS_FALLBACK
    gender_as_string = infer_gender_should_be_string(diabetes_model)
    gender_value = g if gender_as_string else (1.0 if g == "male" else 0.0)

    pregnancies = safe_float(req.pregnancies, "pregnancies")
    glucose = safe_float(req.glucose, "glucose")
    bloodPressure = safe_float(req.bloodPressure, "bloodPressure")
    skinThickness = safe_float(req.skinThickness, "skinThickness")
    insulin = safe_float(req.insulin, "insulin")
    bmi = safe_float(req.bmi, "bmi")
    diabetesPedigree = safe_float(req.diabetesPedigree, "diabetesPedigree")
    age = safe_float(req.age, "age")

    value_map = {
        "Gender": gender_value, "gender": gender_value,
        "Pregnancies": pregnancies, "pregnancies": pregnancies,
        "Glucose": glucose, "glucose": glucose,
        "BloodPressure": bloodPressure, "bloodPressure": bloodPressure,
        "SkinThickness": skinThickness, "skinThickness": skinThickness,
        "Insulin": insulin, "insulin": insulin,
        "BMI": bmi, "bmi": bmi,
        "DiabetesPedigreeFunction": diabetesPedigree, "diabetesPedigree": diabetesPedigree,
        "Age": age, "age": age,
    }

    row = {}
    for col in expected_cols:
        if col not in value_map:
            raise HTTPException(status_code=400, detail=f"Model expects '{col}' but mapping is missing it.")
        row[col] = value_map[col]

    X = pd.DataFrame([row])

    if not gender_as_string:
        for c in X.columns:
            X[c] = pd.to_numeric(X[c], errors="coerce")
    else:
        for c in X.columns:
            if c.lower() == "gender":
                continue
            X[c] = pd.to_numeric(X[c], errors="coerce")

    bad_cols = [
        c for c in X.columns
        if pd.isna(X.loc[0, c]) and not (gender_as_string and c.lower() == "gender")
    ]
    if bad_cols:
        raise HTTPException(status_code=400, detail=f"Invalid / missing numeric values for: {bad_cols}")

    try:
        pred_raw = diabetes_model.predict(X)[0]

        if hasattr(diabetes_model, "predict_proba"):
            probs = diabetes_model.predict_proba(X)[0]
            classes = try_get_classes(diabetes_model)
            pos_idx = get_positive_class_index(classes)
            proba = float(probs[pos_idx])
        else:
            classes = try_get_classes(diabetes_model)
            proba = None

        pred_str = str(pred_raw).strip().lower()
        pred = 1 if pred_raw in [1, True, "1"] or pred_str in ["diabetic", "positive"] else 0

        return {
            "prediction": pred,
            "label": "Diabetic" if pred == 1 else "Non-Diabetic",
            "probability": proba,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/chatbot")
def chatbot(req: ChatRequest):
    text = normalize_chat_text(req.message)

    if not text:
        replies = RESPONSES.get("fallback") or ["Please type a message."]
        return {"intent": "fallback", "confidence": 0.0, "reply": replies[0]}

    simple_greetings = {
        "hi", "hello", "hey", "hi there", "hello there",
        "good morning", "good evening", "good afternoon", "hiya"
    }

    simple_thanks = {
        "thanks", "thank you", "thx", "thanks a lot"
    }

    simple_goodbye = {
        "bye", "goodbye", "see you", "see you later"
    }

    simple_identity = {
        "who are you", "what are you", "what is your name", "tell me about yourself"
    }

    if text in simple_greetings:
        replies = RESPONSES.get("greeting") or ["Hello! How can I help you today?"]
        return {"intent": "greeting", "confidence": 1.0, "reply": random.choice(replies)}

    if text in simple_thanks:
        replies = RESPONSES.get("thanks") or ["You're welcome!"]
        return {"intent": "thanks", "confidence": 1.0, "reply": random.choice(replies)}

    if text in simple_goodbye:
        replies = RESPONSES.get("goodbye") or ["Goodbye! Take care."]
        return {"intent": "goodbye", "confidence": 1.0, "reply": random.choice(replies)}

    if text in simple_identity:
        replies = RESPONSES.get("bot_identity") or ["I'm DiaSense Assistant."]
        return {"intent": "bot_identity", "confidence": 1.0, "reply": random.choice(replies)}

    try:
        if hasattr(chatbot_model, "predict_proba"):
            probs = chatbot_model.predict_proba([text])[0]
            classes = get_chatbot_classes(chatbot_model)
            idx = int(np.argmax(probs))
            intent = str(classes[idx])
            confidence = float(probs[idx])
        else:
            pred = chatbot_model.predict([text])[0]
            intent = str(pred)
            confidence = 1.0
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot prediction failed: {str(e)}")

    if confidence < CHATBOT_FALLBACK_THRESHOLD:
        intent = "fallback"

    replies = RESPONSES.get(intent) or RESPONSES.get("fallback") or ["Sorry, I didn't understand."]
    reply = random.choice(replies)

    return {
        "intent": intent,
        "confidence": confidence,
        "reply": reply
    }


@app.post("/wound/predict")
async def wound_predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")

        h, w = img.shape[:2]

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        x = cv2.resize(rgb, (224, 224)).astype(np.float32) / 255.0
        x = np.expand_dims(x, 0)

        model = get_wound_model()
        pred = model.predict(x)[0, :, :, 0]

        binary_mask = (pred > 0.5).astype(np.uint8)
        mask = binary_mask * 255

        wound_pixels = int(np.sum(binary_mask))
        total_pixels = int(binary_mask.shape[0] * binary_mask.shape[1])
        wound_area_percent = (wound_pixels / total_pixels) * 100 if total_pixels > 0 else 0.0

        wound_detected = wound_pixels > 0

        if not wound_detected:
            severity = "None"
            recommendation = "No clear wound region detected. Please upload a clearer wound image if needed."
        elif wound_area_percent < 5:
            severity = "Mild"
            recommendation = "Small wound area detected. Keep the wound clean and monitor healing. Consult a doctor if symptoms worsen."
        elif wound_area_percent < 15:
            severity = "Moderate"
            recommendation = "Moderate wound area detected. Medical consultation is recommended for proper wound care."
        else:
            severity = "Severe"
            recommendation = "Large wound area detected. Please seek medical attention as soon as possible."

        mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)

        ok, buf = cv2.imencode(".png", mask)
        if not ok:
            raise HTTPException(status_code=500, detail="Failed to encode mask")

        mask_b64 = base64.b64encode(buf.tobytes()).decode("utf-8")

        return {
            "mask": mask_b64,
            "wound_detected": wound_detected,
            "wound_area_percent": round(wound_area_percent, 2),
            "severity": severity,
            "recommendation": recommendation
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wound prediction failed: {str(e)}")