import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage


SUPPORTED_LANGS: dict[str, str] = {
    "pt": "portugues",
    "en": "ingles",
    "es": "espanhol",
}


class LLMService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="Qwen/Qwen2.5-7B-Instruct",
            temperature=0.5,
            top_p=0.7,
            api_key=os.getenv("HF_TOKEN"),  # type: ignore
            base_url="https://router.huggingface.co/v1",
        )

    def summarize_text(self, text: str, lang: str) -> str:
        if lang not in SUPPORTED_LANGS:
            raise ValueError("Language not supported")

        lang_name = SUPPORTED_LANGS[lang]

        system_prompt = (
            f"Voce e um assistente especializado em resumir textos. "
            f"Resuma o texto recebido em ate 3 frases e traduza o resumo para {lang_name}. "
            f"Retorne APENAS o resumo traduzido, sem explicacoes adicionais."
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=text),
        ]

        response = self.llm.invoke(messages)
        return str(response.content)
