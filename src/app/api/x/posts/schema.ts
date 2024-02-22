import {z} from "zod";

export const schema = z.object({
    content: z.string()
        .min(5, "Enter at least 5 characters")
        .max(250, "Enter at most 250 characters")
})