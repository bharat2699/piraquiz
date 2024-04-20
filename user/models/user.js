import { Schema, model } from "mongoose";
import { genSalt, hash as _hash, compare } from "bcrypt";
import { randomUUID } from "crypto";

const userSchema = new Schema({
    uuid: {
        type: 'UUID',
        default: () => randomUUID(),
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: false,
        match: /^[a-zA-Z ]+$/,
    },
    userName: {
        type: String,
        required: false,
    },
    dob: {
        type: Date,
        required: false,
        default: Date.now,
    },
    contact: {
        type: BigInt,
        required: false,
        min: 6000000000,
        max: 9999999999,
    },
    socketId: {
        type: String,
        required: false,
        default: "",
    },
});

//hashing passwords
userSchema.pre("save", async function (next) {
    try {
        const user = this;
        if (!user.isModified("password")) {
            return next();
        }
        const salt = await genSalt(10);
        const hash = await _hash(user.password, salt);
        user.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

//comparing passwords method
userSchema.methods.comparePassword = async function (enteredPassword) {
    const user = this;
    try {
        const isMatch = await compare(enteredPassword, user.password);
        if (!isMatch) {
            throw new Error('Passwords do not match');
        }
        return true;
    } catch (err) {
        throw err;
    }
};

// model("User", userSchema);
const User = model("User", userSchema);

export default User;