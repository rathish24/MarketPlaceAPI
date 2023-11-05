

export class DataPreparation {

    public static async convertObjectsToStringsInPayload(payload) {

        try {

            // Set Date Formats
            // Convert Object to String
            // Trim Email, Mobile

            let keys = Object.keys(payload);

            for (let i = 0; i < keys.length; i++) {

                if (typeof (payload[keys[i]]) == 'object') {

                    payload[keys[i]] = JSON.stringify(payload[keys[i]]);
                }
            }
            return payload;
        } catch (err) {

            return {};
        }
    }

    public static async deleteUnwantedKeysFromArray(payload) {

        try {

            return payload;
        } catch (err) {

            return {};
        }
    }

}