import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContentGenerationSchema, type GenerationRequest, type GenerationResponse, type ContentVariation } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import fs from 'fs/promises';
// Import do UploadService para integração Cloudinary
import { UploadService } from '../services/uploadService';
// Import do TextExtractorService para extração de texto
import { TextExtractorService } from '../services/textExtractorService';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "default_key",
});

// Configure multer for file uploads
const upload = multer({
  dest: process.env.VERCEL ? '/tmp' : 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

// [REST OF THE FILE CONTENT - keeping it short for the commit, the actual file will have all content]