"""Centralized Groq API client singleton.

All AI services (summarizer, qa_engine, metrics_extractor) must import
`groq_client` from this module rather than constructing their own Groq
client instance, so API key handling and client configuration live in
exactly one place.
"""

import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

if "GROQ_API_KEY" not in os.environ:
    raise EnvironmentError("GROQ_API_KEY is not set. Add it to your .env file.")

groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
