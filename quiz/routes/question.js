import { Router } from "express";
import { model } from "mongoose";

const router = Router();
const Questions = model("Questions");

//create question mock
router.post("/question", async (req, res) => {
    const { topic, question, option1, option2, option3, option4, correctOption } = req.body;
    try {
        if (!topic || !question || !option1 || !option2 || !option3 || !option4 || !correctOption) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newQuestion = new Questions({
            topic,
            question,
            option1,
            option2,
            option3,
            option4,
            correctOption
        });

        const savedQuestion = await newQuestion.save();
        if (!savedQuestion) {
            return res.status(500).json({ error: "Failed to save question" });
        }

        res.json({ message: "Question created successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

//get question by topic
router.get("/question", async (req, res) => {
    const { topic } = req.query;
    try {
        if (!topic) {
            return res.status(400).json({ error: "Missing required query parameter: topic" });
        }
        const count = await Questions.countDocuments({ topic });
        const randomQuestions = [];
        for (let i = 0; i < 5; i++) {
            const randomNum = Math.floor(Math.random() * count) + 1;
            const question = await Questions.findOne({ topic }).skip(randomNum).exec();
            if (question) {
                randomQuestions.push(question);
            }
        }
        res.status(200).json(randomQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
