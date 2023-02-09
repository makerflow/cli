import { GluegunCommand, GluegunToolbox } from 'gluegun'

const command: GluegunCommand = {
    name: 'default-duration',
    alias: ["dd", "duration", "pomodoro"],
    description: 'Sets the default duration for Flow Mode if none is specified',
    run: async (toolbox: GluegunToolbox): Promise<void> => {
        if (toolbox.parameters.options.help) {
            toolbox.print.info("==========================")
            toolbox.print.info("Configure default duration")
            toolbox.print.info("==========================")
            toolbox.print.info("Configure how long you want your usual Flow Modes to run for a pomodoro like timed experience.")
            toolbox.print.info("Run this command (makerflow config default-duration) and follow the prompts on your screen.")
            return;
        }
        toolbox.setupDefaultDuration()
    }
}

module.exports = command