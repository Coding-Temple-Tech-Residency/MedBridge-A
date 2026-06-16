# TR Project Template

## Project Information

Please complete the following before submitting your repository.

**Project Name:**  
**Team Name:**  
**Cohort / Sprint:**  
**Team Members:**  
**Tech Stack:** 

## Project Overview



Patients consistently struggle to understand their medical records, lab results, and physician notes. This gap in health literacy leads to poor medication adherence, missed follow-ups, and preventable ER visits.

MedBridge is a web application that lets patients upload or paste their medical documents and receive plain-language explanations, personalized health summaries, and actionable next steps, all powered by AI.

## Setup & Documentation



## Getting started

# 1. Clone the repo and enter the backend
git clone <repo-url>
cd healthcare-app/backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env              # then open .env and fill in real values

# 5. Create the database (one time)
createdb healthcare               # or: psql -c "CREATE DATABASE healthcare;"

# 6. Run migrations (once Alembic is set up)
# alembic upgrade head

# 7. Start the dev server
fastapi dev app/main.py



## Notes

List any known limitations, incomplete features, or important technical considerations.

## Development Standards Reminder

All submissions should reflect professional engineering standards:

- Write clean, readable, and modular code  
- Use clear naming conventions  
- Remove unused files, variables, and console logs  
- Follow consistent formatting and linting practices  
- Write meaningful commit messages  
- Keep branches organized and avoid pushing broken code to main  
- Review teammate pull requests respectfully and constructively  

Your repository should be organized, understandable, and demo-ready.

## Intellectual Property Notice

This project was created as part of a Coding Temple Tech Residency. All work produced during the residency is considered the intellectual property of Coding Temple or the sponsoring employer, unless otherwise stated in a signed agreement. By contributing to this project, you acknowledge and agree to these terms.
