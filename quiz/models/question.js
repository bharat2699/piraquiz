import { Schema, model } from "mongoose";

const questionSchema = new Schema({
    uuid: {
        type: 'UUID',
        default: () => randomUUID(),
    },
    topic: {
        type: String,
        required: true,
        maxLength: 100,
        minLength: 5,
    },
    question: {
        type: String,
        required: true,
        maxLength: 500,
        minLength: 10
    },
    option1: {
        type: String,
        required: true,
        maxLength: 100,
        minLength: 3
    },
    option2: {
        type: String,
        required: true,
        maxLength: 100,
        minLength: 3
    },
    option3: {
        type: String,
        required: true,
        maxLength: 100,
        minLength: 3
    },
    option4: {
        type: String,
        required: true,
        maxLength: 100,
        minLength: 3
    },
    correctOption: {
        type: String,
        required: true,
        maxLength: 100,
        minLength: 3
    }
});

const Questions = model("Questions", questionSchema);

export default Questions;
