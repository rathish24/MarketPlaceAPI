"use strict";
import { Response } from '../classes/Response'
import { StatusCodes } from '../classes/StatusCodes';
import { CustomMessages } from '../classes/CustomMessages';
import { camelizeKeys, decamelizeKeys } from 'humps'
import * as R from 'ramda'
import * as request from 'request';


export default class SendFcmNotificationsServiceImpl {

    public fcmSecretKey: any;
    private tableName;
    private mainTableName;

    constructor(fcmSecretKey) {
        this.fcmSecretKey = "key=" + fcmSecretKey;
    }

    public async sendIndividualNotification(data, tokens) {

        let response: Response;

        try {
          
         let fcmResponse = await new Promise(resolve => {

                var options = {
                    method: 'POST',
                    json: true,
                    jar: true,
                    body:
                    {
                        to: tokens,
                        collapse_key: "type_a",
                        data: data,
                        notification: data
                    },
                    headers: {
                        "Authorization": this.fcmSecretKey
                    },
                    uri: 'https://fcm.googleapis.com/fcm/send'
                }

                request(options, function (err, response, body) {

                    if (err) {

                        resolve(err);
                    }

                    resolve(body);
                });
            });

            console.log("Fcm Response", fcmResponse);

            return true;

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;

    }



    public async sendTopicNotification(data, topicName) {

        let response: Response;

        try {
            let topic = "/topics/" + topicName;

            let fcmResponse = await new Promise(resolve => {

                var options = {
                    method: 'POST',
                    json: true,
                    jar: true,
                    body:
                    {
                        to: topic,
                        collapse_key: "type_a",
                        data: data,
                        notification: data
                    },
                    headers: {
                        "Authorization": this.fcmSecretKey
                    },
                    uri: 'https://fcm.googleapis.com/fcm/send'
                }

                request(options, function (err, response, body) {

                    if (err) {

                        resolve(err);
                    }

                    resolve(body);
                });
            });

            console.log("Fcm Response", fcmResponse);

            return true;

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;

    }

}