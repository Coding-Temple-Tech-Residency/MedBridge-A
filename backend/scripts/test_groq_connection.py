"""Throwaway connectivity check for AI-201. Confirms GROQ_API_KEY works
before any real AI engine work begins. Safe to delete once the team has
all confirmed it runs clean."""

from dotenv import load_dotenv
import os

load_dotenv()

from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response)
