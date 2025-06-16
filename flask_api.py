import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from youtube_transcript_api import TranscriptsDisabled, YouTubeTranscriptApi

app = Flask(__name__)
CORS(app)

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MODEL_KWARGS = {"device": "cpu"}
ENCODE_KWARGS = {"normalize_embeddings": False}

current_video_id = None
current_chain = None
chat_history = {}
model = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL"), google_api_key=os.getenv("GOOGLE_API_KEY")
)


def setup_chatbot_for_video(video_id):
    """set up the chatbot for a specific video"""
    global current_video_id, current_chain

    if current_video_id == video_id and current_chain:
        return True

    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(
            video_id, languages=["en"]
        )
        transcript = " ".join(chunk["text"] for chunk in transcript_list)
        # Creating Chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.create_documents([transcript])
        embedding = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME,
            model_kwargs=MODEL_KWARGS,
            encode_kwargs=ENCODE_KWARGS,
        )
        vector_store = FAISS.from_documents(chunks, embedding)

        retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 2})

        prompt = PromptTemplate(
            template="""
            You are a knowledgeable and concise assistant.
            Respond only based on the information provided in the transcript below.
            If the context does not contain enough information to answer the question, respond with:
            "I'm not sure based on the provided context."

            Previous Conversation:
            {chat_history}

            Transcript:
            {context}

            Question:
            {question}
            """,
            input_variables=["context", "question", "chat_history"],
        )
        print("prompt", prompt)

        def format_docs(retrieved_docs):
            context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
            return context_text

        def format_chat_history(chat_list):
            if not chat_list:
                return "No previous conversation."
            formatted = []
            for entry in chat_list:
                formatted.append(f"{entry['role']}: {entry['content']}")
            return "\n".join(formatted)

        parser = StrOutputParser()

        parallel_chain = RunnableParallel(
            {
                "context": retriever | RunnableLambda(format_docs),
                "question": RunnablePassthrough(),
                "chat_history": RunnableLambda(
                    lambda x: format_chat_history(
                        chat_history.get(current_video_id, [])
                    )
                ),
            }
        )

        current_chain = parallel_chain | prompt | model | parser
        current_video_id = video_id

        return True

    except TranscriptsDisabled:
        print("No captions available for this video")
        return False


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    video_id = data.get("video_id")
    message = data.get("message")

    if not video_id or not message:
        return jsonify({"error": "Missing video_id or message"}), 400

    if not setup_chatbot_for_video(video_id):
        return (
            jsonify({"error": "Could not process this video, No transcript available"}),
            400,
        )

    try:
        response = current_chain.invoke(message)
        if video_id not in chat_history:
            chat_history[video_id] = []

        chat_history[video_id].append({"role": "User", "content": message})
        chat_history[video_id].append({"role": "Bot", "content": response})
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": f"Error processing message:{str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
