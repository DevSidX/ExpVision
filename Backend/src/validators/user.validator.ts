import { z } from "zod";

const updateUserschema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
})

type updateUserType = z.infer<typeof updateUserschema>

export{ updateUserschema, updateUserType }