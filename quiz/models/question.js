import { Schema, model } from "mongoose";
import { randomUUID } from "crypto";

const questionSchema = new Schema({
    uuid: {
        type: 'UUID',
        default: () => randomUUID(),
    },
    topic: {
        type: String,
        required: true,
        maxLength: 100,
    },
    question: {
        type: String,
        required: true,
        maxLength: 500,
    },
    option1: {
        type: String,
        required: true,
        maxLength: 100,
    },
    option2: {
        type: String,
        required: true,
        maxLength: 100,
    },
    option3: {
        type: String,
        required: true,
        maxLength: 100,
    },
    option4: {
        type: String,
        required: true,
        maxLength: 100,
    },
    correctOption: {
        type: String,
        required: true,
        maxLength: 100,
    }
});

const Questions = model("Questions", questionSchema);

export default Questions;
