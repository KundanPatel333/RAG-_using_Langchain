import "dotenv/config";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

async function indexDocument() {
  // 1. Load PDF
  const loader = new PDFLoader("./Dsa.pdf");
  const docs = await loader.load();
  console.log("PDF loaded");

  // 2. Chunking
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);
  console.log("Chunking completed");

  // 3. Gemini Embeddings
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "text-embedding-004",
  });

  // 4. Pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  // 5. Store vectors
  await PineconeStore.fromDocuments(chunks, embeddings, {
    pineconeIndex: index,
  });

  console.log("✅ Data stored successfully in Pinecone");
}

indexDocument();
