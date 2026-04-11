import mongoose,{Schema} from "mongoose";

const ExpenseSchema = new Schema(
    {
        description:{
            type:String,
            required:true,
            trim:true,
        },
        amount:{
            type: Number,
            required:true,
        },
        category:{
            type: String,
            default:'General'
        },
        date:{
            type: Date,
            default: Date.now,
        },
        // Recurring transaction fields
        recurring: {
            type: Boolean,
            default: false,
        },
        recurrence: {
            type: String,
            enum: ['monthly'],
            default: 'monthly'
        },
        startDate: {
            type: Date,
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User',
        },
        // Audit: who actually submitted (null = owner submitted themselves)
        submitted_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Optional: expense charged against a shared budget
        budget: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Budget',
            default: null,
        },
    },
    {
        timestamps:true,
    }
)

export const Expense = mongoose.model('Expense',ExpenseSchema);