import { useState } from "react";
import "./App.css";
import AuthCard from "./AuthCard";
import "./ResumeAI_Login.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [skills, setSkills] = useState([]);
  const [selectedJob, setSelectedJob] = useState("Python Developer");
  const [matchResult, setMatchResult] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkJobMatch = async () => {
    if (skills.length === 0) {
      alert("Please upload and analyze your resume first.");
      return;
    }

    const jobSkills = {
      "Python Developer": ["Python", "Flask", "SQL", "Git", "Django"],
      "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Git"],
      "Data Scientist": ["Python", "Machine Learning", "Data Science", "SQL", "Git"],
    };

    try {
      const response = await fetch("https://ai-resume-job-matching.onrender.com/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_skills: skills,
          job_skills: jobSkills[selectedJob],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Job matching failed.");
        return;
      }

      setMatchResult(data);
    } catch (error) {
      alert("Job matching failed. Please check the Flask server.");
    }
  };

  const generateRecommendations = (resumeSkills) => {
    if (!resumeSkills || resumeSkills.length === 0) {
      setRecommendedJobs([]);
      return;
    }

    const jobs = {
      "Python Developer": ["Python", "Flask", "SQL", "Git", "Django"],
      "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Git"],
      "Data Scientist": ["Python", "Machine Learning", "Data Science", "SQL", "Git"],
      "Backend Developer": ["Python", "Flask", "SQL", "PostgreSQL", "Git"],
      "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Python", "SQL"],
    };

    const recommendations = Object.entries(jobs).map(([jobName, jobSkills]) => {
      const matchingSkills = jobSkills.filter((jobSkill) =>
        resumeSkills.some(
          (resumeSkill) =>
            resumeSkill.toLowerCase() === jobSkill.toLowerCase()
        )
      );

      const percentage = Math.round(
        (matchingSkills.length / jobSkills.length) * 100
      );

      return { jobName, percentage, matchingSkills };
    });

    recommendations.sort((a, b) => b.percentage - a.percentage);
    setRecommendedJobs(recommendations.slice(0, 3));
  };

  const uploadResume = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const response = await fetch("https://ai-resume-job-matching.onrender.com/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setUploadMessage(data.message || "Resume upload failed.");
        return;
      }

      const detectedSkills = data.skills || [];
      setUploadMessage(data.message || "Resume analyzed successfully.");
      setSkills(detectedSkills);
      setMatchResult(null);
      generateRecommendations(detectedSkills);
    } catch (error) {
      setUploadMessage("Upload failed. Please check the Flask server.");
    }
  };

  const handleLoginSuccess = (username) => {
    setLoggedInUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setLoggedInUser("");
    setIsAuthenticated(false);
    setSelectedFile(null);
    setUploadMessage("");
    setSkills([]);
    setMatchResult(null);
    setRecommendedJobs([]);
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <AuthCard onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* ================================
              NAVIGATION BAR
          ================================= */}
          <nav className="navbar">
            <div className="logo">🤖 ResumeAI</div>

            <div className="nav-links">
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#about">About</a>

              <span className="welcome-user">
                Hi, {loggedInUser}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </nav>

          {/* ================================
              HERO SECTION
          ================================= */}
          <section className="hero-section" id="home">
            <div className="hero-content">
              <p className="tagline">AI-POWERED CAREER ASSISTANT</p>

              <h1>
                Find Your Perfect Job
                <br />
                <span>With AI</span>
              </h1>

              <p className="description">
                Upload your resume and let our AI analyze your skills,
                qualifications and experience to find the best matching job
                opportunities.
              </p>
            </div>

            {/* ================================
                DEMO ANALYSIS CARD
            ================================= */}
            <div className="analysis-card">
              <div className="card-header">
                <span>📊</span>
                <strong>Resume Analysis</strong>
              </div>

              <div className="score">
                <div className="score-circle">
                  <strong>{skills.length > 0 ? skills.length : "—"}</strong>
                  <small>{skills.length > 0 ? "Skills" : "Upload"}</small>
                </div>
              </div>

              {skills.length > 0 ? (
                skills.slice(0, 5).map((skill, index) => (
                  <div className="skill" key={index}>
                    <span>{skill}</span>
                    <span>✓</span>
                  </div>
                ))
              ) : (
                <p>Upload your resume to see your detected skills.</p>
              )}
            </div>
          </section>

          {/* ================================
              RESUME ANALYZER
          ================================= */}
          <section className="resume-tool">
            <h2>Analyze Your Resume</h2>

            <p className="tool-description">
              Upload your PDF resume and let our AI identify your skills.
            </p>

            <div className="upload-panel">
              {/* UPLOAD AREA */}
              <div className="upload-box">
                <div className="upload-icon">📄</div>

                <h3>Upload Resume</h3>

                <p>Select your PDF resume</p>

                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(event) => {
                    const file = event.target.files[0];
                    setSelectedFile(file || null);
                    setUploadMessage("");
                    setMatchResult(null);
                  }}
                />

                <label
                  htmlFor="resume-upload"
                  className="primary-btn"
                >
                  📄 Select Resume
                </label>

                {selectedFile && (
                  <p className="selected-file">
                    📄 {selectedFile.name}
                  </p>
                )}

                {selectedFile && (
                  <button
                    className="secondary-btn upload-server-btn"
                    onClick={uploadResume}
                  >
                    ⬆️ Upload & Analyze
                  </button>
                )}

                {uploadMessage && (
                  <p className="upload-message">{uploadMessage}</p>
                )}
              </div>

              {/* JOB MATCHING */}
              <div className="job-box">
                <div className="job-icon">🎯</div>

                <h3>Select a Job</h3>

                <p>
                  Choose a job to compare with your resume.
                </p>

                <select
                  value={selectedJob}
                  onChange={(event) => {
                    setSelectedJob(event.target.value);
                    setMatchResult(null);
                  }}
                >
                  <option value="Python Developer">Python Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                </select>

                <button
                  className="primary-btn"
                  onClick={checkJobMatch}
                >
                  Check Job Match →
                </button>
              </div>
            </div>

            {/* DETECTED SKILLS */}
            {skills.length > 0 && (
              <div className="detected-skills">
                <h3>
                  🎯 Detected Skills
                  <span className="skill-count">{skills.length}</span>
                </h3>

                <div className="skills-list">
                  {skills.map((skill, index) => (
                    <span className="skill-tag" key={index}>
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MATCH RESULT */}
            {matchResult && (
              <div className="match-result">
                <h3>🎯 Job Match Result</h3>

                <p>
                  <strong>Selected Job:</strong> {selectedJob}
                </p>

                <div className="match-score">
                  <strong>{matchResult.match_percentage}%</strong>
                  <span>Match</span>
                </div>

                <h4>✅ Matching Skills</h4>

                <div className="skills-list">
                  {(matchResult.matching_skills || []).map(
                    (skill, index) => (
                      <span className="skill-tag" key={index}>
                        ✓ {skill}
                      </span>
                    )
                  )}
                </div>

                <h4>❌ Missing Skills</h4>

                <div className="skills-list">
                  {(matchResult.missing_skills || []).map(
                    (skill, index) => (
                      <span className="missing-skill-tag" key={index}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ================================
              RECOMMENDED JOBS
          ================================= */}
          {recommendedJobs.length > 0 && (
            <div className="recommended-jobs">
              <h3>💼 Recommended Jobs</h3>

              <div className="recommendation-grid">
                {recommendedJobs.map((job, index) => (
                  <div className="recommendation-card" key={index}>
                    <h4>{job.jobName}</h4>

                    <div className="recommendation-score">
                      {job.percentage}% Match
                    </div>

                    <p>
                      {job.matchingSkills.length} matching skills
                    </p>

                    <div className="skills-list">
                      {job.matchingSkills.map(
                        (skill, skillIndex) => (
                          <span
                            className="skill-tag"
                            key={skillIndex}
                          >
                            ✓ {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================
              FEATURES
          ================================= */}
          <section className="features" id="features">
            <h2>Powerful AI Features</h2>

            <p className="section-description">
              Everything you need to find the right career opportunity.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">📄</div>

                <h3>Resume Analysis</h3>

                <p>
                  AI analyzes your resume and extracts your skills,
                  education and experience.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎯</div>

                <h3>Job Matching</h3>

                <p>
                  Compare your resume with job descriptions and calculate
                  your job match percentage.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💡</div>

                <h3>Skill Gap Analysis</h3>

                <p>
                  Discover missing skills and understand what you need to
                  improve for your dream job.
                </p>
              </div>
            </div>
          </section>

          {/* ================================
              HOW IT WORKS
          ================================= */}
          <section className="about" id="about">
            <h2>How It Works</h2>

            <div className="steps">
              <div className="step">
                <div>1</div>
                <h3>Upload Resume</h3>
                <p>Upload your PDF resume.</p>
              </div>

              <div className="step">
                <div>2</div>
                <h3>AI Analysis</h3>
                <p>Our AI extracts your skills and qualifications.</p>
              </div>

              <div className="step">
                <div>3</div>
                <h3>Get Matches</h3>
                <p>Receive suitable job recommendations.</p>
              </div>
            </div>
          </section>

          {/* ================================
              FOOTER
          ================================= */}
          <footer>
            <p>
              © 2026 ResumeAI | AI Resume Screening & Job Matching System
            </p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
