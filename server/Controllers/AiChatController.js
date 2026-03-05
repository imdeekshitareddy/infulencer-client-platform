const axios = require("axios");
const Influencer = require("../Models/InfluencerModel");
const Promotion = require("../Models/PromotionModel");

const chatWithAI = async (req, res) => {

  try {

    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // ==============================
    // 1️⃣ Check database queries first
    // ==============================

    if (lowerMsg.includes("fashion influencer")) {

      const influencers = await Influencer.find({
        niche: { $regex: "fashion", $options: "i" }
      }).limit(5);

      if (influencers.length === 0) {
        return res.json({
          reply: "No fashion influencers found yet."
        });
      }

      const reply = influencers.map(i =>
        `• **${i.name}** - ${i.followers || "N/A"} followers`
      ).join("\n");

      return res.json({
        reply: `Here are some fashion influencers:\n\n${reply}`
      });
    }

    if (lowerMsg.includes("promotion") || lowerMsg.includes("campaign")) {

      const promotions = await Promotion.find().limit(5);

      if (promotions.length === 0) {
        return res.json({
          reply: "No promotions are currently available."
        });
      }

      const reply = promotions.map(p =>
        `• **${p.title}** – Budget: ${p.budget || "Not specified"}`
      ).join("\n");

      return res.json({
        reply: `Here are some active promotions:\n\n${reply}`
      });
    }

    // ==============================
    // 2️⃣ Otherwise use Gemini AI
    // ==============================

    const models = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];

    let reply = null;

    for (let model of models) {

      try {

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are the AI assistant for CollabSphere.

IMPORTANT RESPONSE RULES:
- Keep answers SHORT (2-4 sentences maximum)
- Use simple and friendly language
- Avoid long paragraphs
- Use bullet points if needed
- Sound like a helpful chatbot

About the platform:
CollabSphere connects influencers with brands.

Features:
• Influencers create profiles
• Brands create promotions
• Influencers apply to promotions
• Users can chat and collaborate

User question: ${message}`
                  }
                ]
              }
            ]
          }
        );

        reply = response.data.candidates[0].content.parts[0].text;

        break;

      } catch (err) {

        console.log(`Model ${model} failed, trying next...`);

      }

    }

    if (!reply) {
      return res.status(500).json({
        error: "All AI models are busy. Please try again later."
      });
    }

    res.json({ reply });

  } catch (error) {

    console.log("Gemini Error:", error.response?.data || error.message);

    res.status(500).json({
      error: "AI request failed"
    });

  }

};

module.exports = { chatWithAI };