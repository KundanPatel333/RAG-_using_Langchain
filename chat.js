import "dotenv/config";
import readlineSync from "readline-sync";

import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";

// Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

// Vector store
const vectorStore = await PineconeStore.fromExistingIndex(
  embeddings,
  { pineconeIndex: index }
);

// Gemini Chat Model (FREE)
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "models/gemini-1.5-flash-latest",
  temperature: 0,
});

const retriever = vectorStore.asRetriever({ k: 4 });

console.log("Ask a question (type 'exit' to quit):");

while (true) {
  const question = readlineSync.question("> ");

  if (question.toLowerCase() === "exit") break;

  const docs = await retriever.getRelevantDocuments(question);
  const context = docs.map(d => d.pageContent).join("\n\n");

  const response = await model.invoke(
    `Answer ONLY from the context below.\n\nContext:\n${context}\n\nQuestion:\n${question}`
  );

  console.log("\nAnswer:\n", response.content);
}
