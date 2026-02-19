import OpenAI from 'openai';
import sql from '../configs/db.js';
import { clerkClient } from '@clerk/express';
import axios from 'axios';
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
// 1. Point to the base OpenAI-compatible bridge
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not set in environment variables!");
}

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY, 
    // This is the stable URL for 2026
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" 
});

export const generateArticle = async(req, res) => {
    try {
        const authObj = typeof req.auth === 'function' ? await req.auth() : req.auth;
        const { userId } = authObj || {};
        const { prompt, length } = req.body;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage || 0;

        // Quota Check
        if (plan !== 'premium' && Number(free_usage) >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to continue" });
        }

        // Map the numeric "length" to a target word range
        let minWords = 500;
        let maxWords = 800;
        const numericLength = Number(length) || 800;

        if (numericLength <= 800) {
            minWords = 500;
            maxWords = 800;
        } else if (numericLength <= 1200) {
            minWords = 800;
            maxWords = 1200;
        } else {
            minWords = 1200;
            maxWords = 1800;
        }

        // Rough conversion from words → tokens (Gemini/OpenAI style)
        const maxTokens = Math.round(maxWords * 1.4);

        const systemPrompt = `You are a professional blog article writer.
        Write clear, engaging content for general readers.
        The article MUST be between ${minWords} and ${maxWords} words long.
        Do not write less than ${minWords - 50} words and do not exceed ${Math.round(maxWords * 1.1)} words.
    Use headings and short paragraphs where appropriate.`;

        // 2. Call Gemini API - try gemini-2.5-flash first (most stable)
        const response = await AI.chat.completions.create({
            model: "gemini-2.5-flash", 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: maxTokens, 
        });

        const content = response.choices[0].message.content;

        // 3. Save to DB
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;
        
        // 4. Update usage in Clerk
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: { 
                    free_usage: (Number(free_usage) || 0) + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        console.error("Full error:", error);
        console.error("Error response:", error.response?.data);
        
        // Return more detailed error message for debugging
        const errorMessage = error.response?.data?.error?.message || error.message || "AI service error";
        res.json({ 
            success: false, 
            message: errorMessage
        });
    }
}

export const generateBlogTitle = async(req, res) => {
    try {
        console.log("=== Blog Title Generation Started ===");
        const authObj = typeof req.auth === 'function' ? await req.auth() : req.auth;
        const { userId } = authObj || {};
        const { prompt, keyword, category } = req.body;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage || 0;

        console.log("User ID:", userId);
        console.log("Keyword:", keyword);
        console.log("Category:", category);
        console.log("Prompt:", prompt);
        console.log("Plan:", plan);
        console.log("Free usage:", free_usage);
        console.log("API Key present:", !!process.env.GEMINI_API_KEY);

        // Quota Check
        if (plan !== 'premium' && Number(free_usage) >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to continue" });
        }

        const topic = (keyword || '').trim();
        const cat = (category || '').trim();
        const effectivePrompt =
            topic && cat
                ? `Keyword: ${topic}\nCategory: ${cat}`
                : String(prompt ?? '');

        const systemPrompt = [
            "You generate blog title ideas in Markdown.",
            "Return EXACTLY this structure (no extra sections):",
            "",
            "Here are a few blog title options for the keyword \"<KEYWORD>\" in the category \"<CATEGORY>\", ranging from beginner-friendly to advanced:",
            "",
            "**Beginner-Friendly:**",
            "- <title 1>",
            "- <title 2>",
            "- <title 3>",
            "- <title 4>",
            "",
            "**Intermediate:**",
            "- <title 1>",
            "- <title 2>",
            "- <title 3>",
            "- <title 4>",
            "",
            "**Advanced:**",
            "- <title 1>",
            "- <title 2>",
            "- <title 3>",
            "- <title 4>",
            "",
            "Rules: Titles must be catchy, specific, and 6–12 words. No explanations. No numbering. No code fences.",
        ].join("\n");

        console.log("Calling Gemini API...");
        // 2. Call Gemini API - try gemini-2.5-flash first (most stable)
        const response = await AI.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `KEYWORD: ${topic || "(not provided)"}\nCATEGORY: ${cat || "(not provided)"}\n\nRequest:\n${effectivePrompt}`,
                },
            ],
            temperature: 0.9,
            max_tokens: 900,
        });

        console.log("API Response received:", !!response);
        console.log("Finish reason:", response?.choices?.[0]?.finish_reason);
        console.log("Full response structure:", JSON.stringify(response, null, 2).substring(0, 500));

        const rawContent =
            response?.choices?.[0]?.message?.content ??
            response?.choices?.[0]?.text ??
            response?.output_text ??
            '';

        let content = Array.isArray(rawContent)
            ? rawContent
                  .map((p) => (typeof p === 'string' ? p : p?.text))
                  .filter(Boolean)
                  .join('')
            : String(rawContent ?? '');

        console.log("Extracted content length:", content.length);
        console.log("Content preview:", content.substring(0, 100));
        
        // Check if response was cut off
        const finishReason = response?.choices?.[0]?.finish_reason;
        if (finishReason === 'length' || finishReason === 'max_tokens') {
            console.warn("WARNING: Response was cut off due to token limit!");
        }
        
        if (!content.trim()) {
            console.error("Empty AI content. Response keys:", Object.keys(response || {}));
            return res.json({
                success: false,
                message: "AI returned an empty response. Try again (or change the keyword).",
            });
        }
        
        // If content is suspiciously short, try fallback once
        if (content.length < 120 && finishReason !== 'stop') {
            console.warn("WARNING: Response seems incomplete. Trying fallback model...");
            console.log("Attempting retry with gemini-2.5-pro...");
            
            try {
                const fallbackResponse = await AI.chat.completions.create({
                    model: "gemini-2.5-pro",
                    messages: [
                        { role: "system", content: systemPrompt },
                        {
                            role: "user",
                            content: `KEYWORD: ${topic || "(not provided)"}\nCATEGORY: ${cat || "(not provided)"}\n\nRequest:\n${effectivePrompt}`,
                        },
                    ],
                    temperature: 0.9,
                    max_tokens: 900,
                });
                
                const fallbackContent = fallbackResponse?.choices?.[0]?.message?.content || '';
                if (fallbackContent.length > content.length) {
                    console.log("Fallback model returned longer content:", fallbackContent.length);
                    content = String(fallbackContent);
                }
            } catch (fallbackError) {
                console.error("Fallback model also failed:", fallbackError.message);
            }
        }

        // 3. Save to DB
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${effectivePrompt}, ${content}, 'blog-title')`;
        
        // 4. Update usage in Clerk
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: { 
                    free_usage: (Number(free_usage) || 0) + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        console.error("Full error:", error);
        console.error("Error response:", error.response?.data);
        
        // Return more detailed error message for debugging
        const errorMessage = error.response?.data?.error?.message || error.message || "AI service error";
        res.json({ 
            success: false, 
            message: errorMessage
        });
    }
}

export const generateImage = async(req, res) => {
    try {
        const authObj = typeof req.auth === 'function' ? await req.auth() : req.auth;
        const { userId } = authObj || {};
        const { prompt, publish } = req.body;
        const plan = req.plan || 'free';
        

        // Quota Check
        if (plan !== 'premium' ) {
            return res.json({ success: false, message: "This feature is only available for premium subscribers" });
        }

        // 2. Call the CURRENT 2026 model: gemini-3-flash-preview
        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},
            responseType: "arraybuffer"
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`

        const {secure_url} = await cloudinary.uploader.upload(base64Image);

        // 3. Save to DB
        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;
        
        

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        console.error("Full error:", error);
        console.error("Error response:", error.response?.data);
        
        // Return more detailed error message for debugging
        const errorMessage = error.response?.data?.error?.message || error.message || "AI service error";
        res.json({ 
            success: false, 
            message: errorMessage
        });
    }
}

export const removeImageBackground = async(req, res) => {
    try {
        const authObj = typeof req.auth === 'function' ? await req.auth() : req.auth;
        const { userId } = authObj || {};
        const  image = req.file;
        const plan = req.plan || 'free';
        

        // Quota Check
        if (plan !== 'premium' ) {
            return res.json({ success: false, message: "This feature is only available for premium subscribers" });
        }

        // 2. Call the CURRENT 2026 model: gemini-3-flash-preview
        

        const {secure_url} = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        });

        // 3. Save to DB
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from the image', ${secure_url}, 'image')`;
        
        

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        console.error("Full error:", error);
        console.error("Error response:", error.response?.data);
        
        // Return more detailed error message for debugging
        const errorMessage = error.response?.data?.error?.message || error.message || "AI service error";
        res.json({ 
            success: false, 
            message: errorMessage
        });
    }
}

export const removeImageObject = async(req, res) => {
    try {
        const authObj = typeof req.auth === 'function' ? await req.auth() : req.auth;
        const { userId } = authObj || {};
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan || 'free';
        

        // Quota Check
        if (plan !== 'premium' ) {
            return res.json({ success: false, message: "This feature is only available for premium subscribers" });
        }

        // 2. Call the CURRENT 2026 model: gemini-3-flash-preview
        

        const {public_id} = await cloudinary.uploader.upload(image.path);

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

        // 3. Save to DB
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;
        
        

        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        console.error("Full error:", error);
        console.error("Error response:", error.response?.data);
        
        // Return more detailed error message for debugging
        const errorMessage = error.response?.data?.error?.message || error.message || "AI service error";
        res.json({ 
            success: false, 
            message: errorMessage
        });
    }
}

export const resumeReview = async(req, res) => {
    try {
        const authObj = typeof req.auth === 'function' ? await req.auth() : req.auth;
        const { userId } = authObj || {};
        const resume = req.file;
        const plan = req.plan || 'free';
        

        // Quota Check
        if (plan !== 'premium' ) {
            return res.json({ success: false, message: "This feature is only available for premium subscribers" });
        }

        // 2. Call the CURRENT 2026 model: gemini-3-flash-preview
        

        if(resume.size > 5*1024*1024){
            return res.json({success: false, message: 'Resume file size exceeds allowed size (5MB).'})
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const parser = new PDFParse({ data: dataBuffer });
        const pdfResult = await parser.getText();
        const resumeText = (pdfResult && typeof pdfResult.text === 'string' ? pdfResult.text : '') || '';
        await parser.destroy();

        if (!resumeText.trim()) {
            return res.json({ success: false, message: 'Could not extract text from the PDF. Please use a different resume file.' });
        }

        const systemPrompt = `
            You are a senior FAANG recruiter, hiring manager, and ATS evaluator.

        First determine the candidate seniority level based on the resume:
        - Fresher / Entry level
        - Mid level (2–5 years)
        - Senior level (5+ years)

        Clearly state the detected level before scoring.

        Then evaluate using appropriate expectations for that level.

        Always start with:

        CANDIDATE LEVEL: <level>
        ATS SCORE: X/100

        SCORING CRITERIA (adjust expectations by level):

        1. Keyword relevance to role
        2. Project or product impact and technical depth
        3. Evidence of metrics, scale, and business impact
        4. Engineering practices and architecture understanding
        5. Core fundamentals and problem solving
        6. Tools, deployment, testing, and reliability
        7. Resume clarity and storytelling
        8. Hiring confidence

        SCORING RULES:
        - Compare candidates against peers at the same level.
        - Freshers are rewarded for strong projects and learning velocity.
        - Mid-level candidates are judged on ownership and production impact.
        - Senior candidates are judged on architecture, scale, leadership, and system design.
        - Score must remain consistent across evaluations unless resume changes.

        After scoring, provide:

        • Strengths  
        • Weaknesses  
        • Missing signals for that level  
        • Bullet rewrites with quantified impact  
        • What is required to reach the next level  
        • Hiring verdict (Reject / Maybe / Interview)

        CRITICAL OUTPUT RULES:
        - Do not summarize.
        - Do not stop mid-sentence.
        - If long, continue until finished.
        - Split into parts if needed.

                RESUME CONTENT:
           ${resumeText}
            `;


            const userPrompt = `
            Evaluate this resume using realistic hiring standards.

            Detect candidate level first, then provide ATS score, breakdown, strengths, weaknesses, improvements, and hiring verdict.

            Resume:
            ${resumeText}

            `;
            

        const response = await AI.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4096,
        });

        const rawContent = response?.choices?.[0]?.message?.content;
        const content = Array.isArray(rawContent)
            ? rawContent.map((p) => (typeof p === 'string' ? p : p?.text)).filter(Boolean).join('')
            : (typeof rawContent === 'string' ? rawContent : '') || '';


        // 3. Save to DB
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded Resume', ${content}, 'resume-review')`;
        
        

        res.json({ success: true, content });

    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        console.error("Full error:", error);
        console.error("Error response:", error.response?.data);
        
        // Return more detailed error message for debugging
        const errorMessage = error.response?.data?.error?.message || error.message || "AI service error";
        res.json({ 
            success: false, 
            message: errorMessage
        });
    }
}