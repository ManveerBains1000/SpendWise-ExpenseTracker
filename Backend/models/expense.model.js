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
        }
    },
    {
        timestamps:true,
    }
)

export const Expense = mongoose.model('Expense',ExpenseSchema);