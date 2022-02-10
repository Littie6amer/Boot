const ms = require("ms");

class Command {

    /**
    * @param {string[] | string} names Names people can use for the command
    * @param {string} description The command description
    * @param {string | number} cooldown The command cooldown (10s || 10000)
    */

    create(names, description, cooldown) {
        if (["object", "string"].includes(typeof names)) {
            this.names = typeof names == "object" ? names : [names]
            this.names.forEach(e => {
                this.names[this.names.indexOf(e)] = e.toLowerCase()
            });
        } else {
            throw "Command name(s) should either be a String or an Array"
        }

        if (["string"].includes(typeof description)) {
            this.description = description
        } else {
            this.description = `The ${this.names[0]} command`
        }

        if (["number", "string"].includes(typeof cooldown)) {
            this.cooldown = typeof cooldown == "number" ? cooldown : ms(cooldown)
        } else {
            this.cooldown = 10000
        }

        this.restricted = false
        this.permissions = { me: [], user: [] }
        this.execute = (toolbox) => {
            if (toolbox.interaction) {
                toolbox.interaction.reply({ content: `\`\`\`[MISSING]: No code was set to execute for this command!\`\`\``, ephemeral: true })
            } else {
                toolbox.message.reply(`\`\`\`[MISSING]: No code was set to execute for this command!\`\`\``)
            }
        }
        this.buttons = {}
        this.dropDowns = {}
        this.create = null
        this.slashExecute = null

        return this
    }

    /**
    * @param {function} execute The code that is executed for this slash command
    * @param {Array} options Slash command options
    */

    makeSlashCommand(execute, options) {
        this.slashExecute = execute || this.execute
        this.slashOptions = options || []
        return this
    }

    /**
    * @param {string[] | string} permissions The premissions the bot requires for the command to function
    */

    addBotPermissions(permissions) {
        if (this.create) return

        if (["object", "string"].includes(typeof permissions)) {
            permissions = typeof permissions == "object" ? permissions : [permissions]
            this.permissions = this.permissions || { me: [], user: [] }
            this.permissions.me = this.permissions.me.concat(permissions)
        } else {
            throw "Command perrmission(s) should either be a String or an Array"
        }

        return this
    }

    /**
    * @param {string[] | string} permissions The premissions the bot requires for the command to function
    */

    addUserPermissions(permissions) {
        if (this.create) return

        if (["object", "string"].includes(typeof permissions)) {
            permissions = typeof permissions == "object" ? permissions : [permissions]
            this.permissions = this.permissions || { me: [], user: [] }
            this.permissions.user = this.permissions.user.concat(permissions)
        } else {
            throw "Command perrmission(s) should either be a String or an Array"
        }

        return this
    }

    /**
    * @param {string} restriction What users can use that command
    */

    restrict() {
        if (this.create) return

        this.restricted = true
        return this
    }

    /**
    * @param {function} execute The code that is executed for this command
    */

    setExecute(execute) {
        if (this.create) return

        if (["function"].includes(typeof execute)) {
            this.execute = execute
        } else {
            throw "Command execute should be a Function"
        }

        return this
    }

    /**
    * @param {string | Array} id The ID(s) it will look for
    * @param {function} execute The code that is executed for this button
    * @param {boolean} checkExact Check if the interaction id matches id completely
    */

    addButton(id, execute, checkExact) {
        if (this.create) return

        if (!["string", "object"].includes(typeof id)) {
            throw "Button ID(s) should either be a String or an Array"
        }

        execute = execute || function (toolbox) {
            toolbox.interaction.reply(`\`\`\`[MISSING]: No code was set to execute for this button!\`\`\``)
        }

        checkExact = checkExact == false ? false : true
        if (typeof id == "string") {
            this.buttons[id] = ({ execute, checkExact })
        } else {
            for (let i in id) {
                this.buttons[id[i]] = ({ execute, checkExact })
            }
        }

        return this
    }

    /**
    * @param {string} id The dropDown ID it will look for
    * @param {string | Array} value The option value it will look for
    * @param {function} execute The code that is executed for this button
    * @param {boolean} checkExact Check if the interaction id matches id completely
    */

    addDropOption(id, values, execute, checkExact) {
        if (this.create) return

        if (!["string", "object"].includes(typeof values)) {
            throw "Option Value(s) should either be a String or an Array"
        }

        if (!["string"].includes(typeof id)) {
            throw "dropDown ID should either be a String"
        }

        execute = execute || function (toolbox) {
            toolbox.interaction.reply(`\`\`\`[MISSING]: No code was set to execute for this option!\`\`\``)
        }

        checkExact = checkExact == false ? false : true
        this.dropDowns[id] = this.dropDowns[id] || { values: {} }
        if (typeof values == "string") {
            this.dropDowns[id].values[values] = { execute, checkExact }
        } else {
            for (let v in values) {
                this.dropDowns[id].values[values[v]] = { execute, checkExact }
            }
        }

        return this
    }

}

module.exports = Command