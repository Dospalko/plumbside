import openai
from core.config import settings
from schemas.ai import JobDraftExtraction

class AIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def transcribe_audio(self, audio_bytes: bytes, filename: str) -> str:
        if not settings.OPENAI_API_KEY:
            raise ValueError("Chýba OpenAI API kľúč.")
            
        response = await self.client.audio.transcriptions.create(
            model="whisper-1",
            file=(filename, audio_bytes)
        )
        return response.text

    async def extract_job_info(self, text: str) -> JobDraftExtraction:
        if not settings.OPENAI_API_KEY:
            raise ValueError("Chýba OpenAI API kľúč.")

        system_prompt = """
        Si AI asistent pre lokálnu servisnú firmu (inštalatéri, elektrikári, atď.) na Slovensku.
        Tvojou úlohou je vyextrahovať údaje o zákazníkovi a detailoch problému z hlasovej správy alebo textovej poznámky.
        Ak niektorý údaj chýba, nechaj ho prázdny (null). Nedomýšľaj si.
        Názov zákazky urob krátky a výstižný. Všetky výstupy musia byť striktne v slovenskom jazyku.
        """

        response = await self.client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            response_format=JobDraftExtraction
        )
        return response.choices[0].message.parsed
