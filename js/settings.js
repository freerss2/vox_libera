/*
** Settings storage
** Implemented as based on local storage
** Could be seamlessly moved to remote back-end storage
*/

class Settings {

    // Usage:
    // const settings = new Settings({"gameDifficulty": {"default": "easy"}, });
    constructor(params) {
        this.params = {}; // Storage for values quick access
        this.storage = localStorage;
        this.markChanges = false;
        
        for (let name in params) {
            // 1. Init with storage value (or "default")
            let storageItemName = `vox_libera_setting_${name}`;
            let methodSuffix = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
            let paramSettings = params[name];
            let default_value = paramSettings["default"] || null;
            let param_type = paramSettings["type"] || "string";
            this.params[name] = this.storage.getItem(storageItemName) || default_value;

            // 2. Generate setter method
            const setterName = `set${methodSuffix}`;
            this[setterName] = (value) => {
                // always convert integer from string
                if (param_type == "int" && value)
                    value = Number(value);
                this.params[name] = value;
                // convert JSON before storing
                if (param_type == "json") {
                    if (value) value = JSON.stringify(value);
                    else       value = '{}';
                }
                this.storage.setItem(storageItemName, value);
                if (this.markChanges) {
                    this.markAsChanged();
                }
            };

            // 3. Generate getter method
            const getterName = `get${methodSuffix}`;
            this[getterName] = () => {
                let result = this.params[name];
                if (param_type == "json") {
                  if (result) {
                    if (typeof result === 'string')
                        result = JSON.parse(result);
                  } else {
                    result = {};
                  }
                }
                return result;
            };
        }
    }

    markAsChanged() {
        this.storage.setItem('vox_libera_updated_at', Date.now());
    }

    getLastChangedTime() {
        return (this.storage.getItem('vox_libera_updated_at') || 0).toString();
    }

    enableChangedFlag() {
        this.markChanges = true;
    }

    disableChangedFlag() {
        this.markChanges = false;
    }
}
