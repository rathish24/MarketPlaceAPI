"use strict";
import { Response } from '../classes/Response'
import { camelizeKeys, decamelizeKeys } from 'humps'
import * as R from 'ramda'
import { CustomMessages } from '../classes/CustomMessages';
import { StatusCodes } from '../classes/StatusCodes';
import { PostgresOrderByObjectInterface } from '../interfaces/PostgresOrderByObjectInterface';


// Create, Validate, Update, Pagination, Search and Filtering 
export default class CommonCrudServiceImpl {

    public postgres: any;
    private tableName;

    constructor(postgres: any, tableName: string) {

        this.postgres = postgres;
        this.tableName = tableName;
    }


    // Unique Checking if index is there
    // Db Exception handling 
    // Response Format
    public async createEntry(payload, uniqeColumns: string[]) {

        let response: Response;

        try {

            let condition = {};
            let isEntryPresent = 0;

            if (uniqeColumns.length != 0) {

                for (let i = 0; i < uniqeColumns.length; i++) {

                    if (payload[uniqeColumns[i]] != undefined)
                        condition[uniqeColumns[i]] = payload[uniqeColumns[i]]
                }

                isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));
            }

            if (isEntryPresent) {

                response = new Response(true, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_ALREADY_PRESENT, {});
            } else {

                payload['created'] = new Date();
                payload['modified'] = new Date();
                let result = await this.postgres(this.tableName).returning("*").insert(decamelizeKeys(payload)).then(R.map(camelizeKeys));
                response = new Response(true, StatusCodes.CREATED, CustomMessages.ENTRY_CREATED_SUCCESSFULLY, result[0]);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    // Update Multiple Entries
    public async updateEntry(condition, payload) {

        let response: Response;

        try {

            let isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

            if (!isEntryPresent) {

                response = new Response(true, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
            } else {

                payload['modified'] = new Date();

                let result = await this.postgres(this.tableName).returning("*").where(decamelizeKeys(condition)).update(decamelizeKeys(payload))
                    .then(R.map(camelizeKeys));

                response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_UPDATED_SUCCESSFULLY, result);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;

    }


    // Get Single Entry
    public async getSingleEntry(condition) {

        let response: Response;

        try {

            let result = await this.postgres(this.tableName).first("*")
                .where(decamelizeKeys(condition))
                .then(camelizeKeys);

            if (!result) {

                response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
            } else {

                response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    // Get All Entries
    // Remove columns from filters / Search which are not in db 
    // Camalize the response before sending 
    public async getAllEntries(size: number, page: number, orderByString: string, filterCondition: Object, rawSearchQuery: string, rawConditionQuery?) {

        let response: Response;

        try {
            if (!rawConditionQuery) {

                rawConditionQuery = true;
            }

            let countObj = await this.postgres(this.tableName)
                .where(decamelizeKeys(filterCondition))
                .whereRaw(rawSearchQuery)
                .whereRaw(rawConditionQuery)
                .count('* as cnt');

            let result = [];

            if (countObj[0]['cnt'] != 0) {

                result = await this.postgres(this.tableName).select("*")
                    .where(decamelizeKeys(filterCondition))
                    .whereRaw(rawSearchQuery)
                    .whereRaw(rawConditionQuery)
                    .limit(size)
                    .offset((page * size))
                    .orderByRaw(orderByString)
                    .then(R.map(camelizeKeys));
            }

            let finalObj = {
                "list": result,
                "count": countObj[0]['cnt']
            }

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalObj);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }


    public async createOrUpdateMultipleEntries(array, columnArray) {

        let response: Response;

        try {

            for (let i = 0; i < array.length; i++) {

                let payload = array[i];

                let condition = {};

                for (let j = 0; j < columnArray.length; j++) {

                    condition[columnArray[j]] = payload[columnArray[j]];
                }

                payload['modified'] = new Date();

                console.log("Payload", payload);
                console.log("Condition", condition);

                let checkEntry = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

                if (checkEntry) {

                    let result = await this.postgres(this.tableName).returning("*").where(decamelizeKeys(condition)).update(decamelizeKeys(payload))
                        .then(R.map(camelizeKeys));

                    response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_UPDATED_SUCCESSFULLY, result);
                } else {


                    if (payload['id'] == 0) {

                        delete payload['id'];
                    }

                    payload['created'] = new Date();
                    payload['modified'] = new Date();
                    let result = await this.postgres(this.tableName).insert(decamelizeKeys(payload)).returning("*").then(R.map(camelizeKeys));
                    response = new Response(true, StatusCodes.CREATED, CustomMessages.ENTRY_CREATED_SUCCESSFULLY, result);
                }
            }
        } catch (err) {

            console.log(err.message);
            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return response;
    }


    // Get All Entries
    // Remove columns from filters / Search which are not in db 
    // Camalize the response before sending 
    public async getAllEntriesArray(filterCondition: Object) {

        try {

            return await this.postgres(this.tableName).select("*")
                .where(decamelizeKeys(filterCondition))
                .then(R.map(camelizeKeys));
        } catch (err) {

            return [];
        }
    }


    // Delete Entries
    public async deleteEntry(condition, payload) {

        let response: Response;

        try {

            let isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

            if (!isEntryPresent) {

                response = new Response(true, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
            } else {

                payload['modified'] = new Date();

                let result = await this.postgres(this.tableName).returning("*").where(decamelizeKeys(condition)).update(decamelizeKeys(payload))
                    .then(R.map(camelizeKeys));

                response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_DELETED_SUCCESSFULLY, result);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }


    public async rawQueryOnDb(query) {

        let response: Response;

        try {

            let result = await this.postgres.raw(query);
            let camalizeResult = R.map(camelizeKeys, result.rows);
            response = new Response(true, StatusCodes.OK, "", camalizeResult);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return response;

    }

    public async getAllEntriesQuery(size: number, page: number, orderByString: string, filterCondition: Object, rawSearchQuery: string, rawConditionQuery?) {

        let response: Response;

        try {
            if (!rawConditionQuery) {

                rawConditionQuery = true;
            }

            let countObj = await this.postgres(this.tableName)
                .where(decamelizeKeys(filterCondition))
                .whereRaw(rawSearchQuery)
                .queryRaw(this.rawQueryOnDb)
                .whereRaw(rawConditionQuery)
                .count('* as cnt');

            let result = [];

            if (countObj[0]['cnt'] != 0) {

                result = await this.postgres(this.tableName).select("*")
                    .where(decamelizeKeys(filterCondition))
                    .whereRaw(rawSearchQuery)
                    .whereRaw(rawConditionQuery)
                    .limit(size)
                    .offset((page * size))
                    .queryRaw(this.rawQueryOnDb)
                    .orderByRaw(orderByString)
                    .then(R.map(camelizeKeys));
            }

            let finalObj = {
                "list": result,
                "count": countObj[0]['cnt']
            }

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalObj);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    public async getAllEntriesForCategory(size: number, page: number, orderByString: string, filterCondition: Object, rawSearchQuery: string,query:string) {

        let response: Response;

        try {

            let result = await this.postgres(this.tableName).select("*")
                .where(decamelizeKeys(filterCondition))
                .whereRaw(rawSearchQuery)
                .whereRaw(query)
                .limit(size)
                .offset((page * size))
                .orderByRaw(orderByString)
                .then(R.map(camelizeKeys));

            let countObj = await this.postgres(this.tableName)
                .where(decamelizeKeys(filterCondition))
                .whereRaw(rawSearchQuery)
                .whereRaw(query)
                .count('* as cnt');

            let finalObj = {
                "list": result,
                "count": countObj[0]['cnt']
            }

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalObj);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }


}