import { z } from "zod";

const reportSettingSchrema = z.object({
    isEnabled: z.boolean().default(true)
})

const updateReportSettingsSchema = reportSettingSchrema.partial();  // .partial() makes all the feild optional

type updateReportSettingsType = z.infer<typeof updateReportSettingsSchema> 
// this means typescript automatically makes 
/*type updateReportSettingsType` = {
  isEnabled?: boolean
}*/

export {
    reportSettingSchrema,
    updateReportSettingsSchema,
    updateReportSettingsType
}