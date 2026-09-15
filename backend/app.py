from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
import os
import re
import psycopg2

app = Flask(__name__)
CORS(app)

# --------------------------------------------------
# POSTGRESQL DATABASE CONNECTION
# --------------------------------------------------

def get_db_connection():
    database_url = os.environ.get("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url)

    # Local PostgreSQL connection
    return psycopg2.connect(
        host="localhost",
        database="login",
        user="postgres",
        password="YOUR_POSTGRES_PASSWORD",
        port="5432"
    )

    return connection

# --------------------------------------------------
# REGISTER USER
# --------------------------------------------------

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if username already exists
        cursor.execute(
            "SELECT id FROM users WHERE username = %s",
            (username,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            connection.close()

            return jsonify({
                "message": "Username already exists"
            }), 409

        # Insert new user
        cursor.execute(
            """
            INSERT INTO users (username, password)
            VALUES (%s, %s)
            """,
            (username, password)
        )

        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "message": "Registration successful"
        }), 201

    except Exception as error:

        return jsonify({
            "message": "Registration failed",
            "error": str(error)
        }), 500


# --------------------------------------------------
# LOGIN USER
# --------------------------------------------------

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, username
            FROM users
            WHERE username = %s AND password = %s
            """,
            (username, password)
        )

        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if user:

            return jsonify({
                "message": "Login successful",
                "user_id": user[0],
                "username": user[1]
            }), 200

        else:

            return jsonify({
                "message": "Invalid username or password"
            }), 401

    except Exception as error:

        return jsonify({
            "message": "Login failed",
            "error": str(error)
        }), 500

# --------------------------------------------------
# TEST DATABASE CONNECTION
# --------------------------------------------------

try:
    connection = get_db_connection()
    print("✅ PostgreSQL database connected successfully!")
    connection.close()
except Exception as error:
    print("❌ Database connection failed:")
    print(error)

# --------------------------------------------------
# UPLOAD FOLDER
# --------------------------------------------------

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# --------------------------------------------------
# SKILLS OUR SYSTEM CAN DETECT
# --------------------------------------------------

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "React",
    "HTML",
    "CSS",
    "Flask",
    "Django",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Git",
    "GitHub",
    "Machine Learning",
    "Data Science",
    "C++",
    "Data Structures",
    "Artificial Intelligence"
]


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/")
def home():

    return "AI Resume Screening & Job Matching System"


# --------------------------------------------------
# RESUME UPLOAD AND ANALYSIS
# --------------------------------------------------

@app.route("/upload-resume", methods=["POST"])
def upload_resume():

    # Check resume
    if "resume" not in request.files:

        return jsonify({
            "message": "No resume file received"
        }), 400


    file = request.files["resume"]


    # Check file name
    if file.filename == "":

        return jsonify({
            "message": "No file selected"
        }), 400


    # Save resume
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    file.save(file_path)


    # --------------------------------------------------
    # READ PDF
    # --------------------------------------------------

    try:

        reader = PdfReader(file_path)

        resume_text = ""

        for page in reader.pages:

            text = page.extract_text()

            if text:

                resume_text += text + "\n"


    except Exception as error:

        return jsonify({

            "message": "Could not read the PDF",

            "error": str(error)

        }), 400


    # --------------------------------------------------
    # DEBUG - PRINT RESUME TEXT
    # --------------------------------------------------

    print("\n========================================")
    print("RESUME TEXT EXTRACTED")
    print("========================================")

    print(resume_text)

    print("========================================")
    print("TEXT LENGTH:", len(resume_text))
    print("========================================")


    # --------------------------------------------------
    # SKILL DETECTION
    # --------------------------------------------------

    detected_skills = []

    # Convert text to lowercase
    resume_text_lower = resume_text.lower()


    # Detect skills
    for skill in SKILLS:

        skill_lower = skill.lower()


        # Create pattern for whole word matching
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill_lower) + r"(?![a-zA-Z0-9])"


        if re.search(pattern, resume_text_lower):

            detected_skills.append(skill)


    # --------------------------------------------------
    # SPECIAL CASES / RESUME VARIATIONS
    # --------------------------------------------------

    # React.js → React
    if (
        "react" not in [skill.lower() for skill in detected_skills]
        and re.search(r"react\.js", resume_text_lower)
    ):

        detected_skills.append("React")


    # --------------------------------------------------
    # REMOVE DUPLICATES
    # --------------------------------------------------

    detected_skills = list(dict.fromkeys(detected_skills))


    # --------------------------------------------------
    # PRINT DETECTED SKILLS
    # --------------------------------------------------

    print("\n========================================")
    print("DETECTED SKILLS:")
    print(detected_skills)
    print("========================================\n")


    # --------------------------------------------------
    # SEND RESULT TO REACT
    # --------------------------------------------------

    return jsonify({

        "message": "Resume analyzed successfully",

        "filename": file.filename,

        "skills": detected_skills,

        "resume_text": resume_text

    })


# --------------------------------------------------
# JOB MATCHING
# --------------------------------------------------

@app.route("/match-job", methods=["POST"])
def match_job():

    data = request.get_json()


    # Get skills from React
    resume_skills = data.get(
        "resume_skills",
        []
    )

    job_skills = data.get(
        "job_skills",
        []
    )


    # --------------------------------------------------
    # CONVERT RESUME SKILLS TO LOWERCASE
    # --------------------------------------------------

    resume_skills_lower = [

        skill.lower()

        for skill in resume_skills

    ]


    # --------------------------------------------------
    # FIND MATCHING SKILLS
    # --------------------------------------------------

    matching_skills = []

    for skill in job_skills:

        if skill.lower() in resume_skills_lower:

            matching_skills.append(skill)


    # --------------------------------------------------
    # FIND MISSING SKILLS
    # --------------------------------------------------

    missing_skills = []

    for skill in job_skills:

        if skill.lower() not in resume_skills_lower:

            missing_skills.append(skill)


    # --------------------------------------------------
    # CALCULATE MATCH PERCENTAGE
    # --------------------------------------------------

    if len(job_skills) > 0:

        match_percentage = round(

            (
                len(matching_skills)
                /
                len(job_skills)
            ) * 100

        )

    else:

        match_percentage = 0


    # --------------------------------------------------
    # PRINT MATCHING RESULT
    # --------------------------------------------------

    print("\n========================================")
    print("JOB MATCHING")
    print("========================================")

    print("Resume Skills:", resume_skills)

    print("Job Skills:", job_skills)

    print("Matching Skills:", matching_skills)

    print("Missing Skills:", missing_skills)

    print("Match Percentage:", match_percentage)

    print("========================================\n")


    # --------------------------------------------------
    # SEND RESULT TO REACT
    # --------------------------------------------------

    return jsonify({

        "match_percentage": match_percentage,

        "matching_skills": matching_skills,

        "missing_skills": missing_skills

    })


# --------------------------------------------------
# START FLASK SERVER
# --------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
    