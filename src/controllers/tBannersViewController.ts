import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';
import { DataPreparation } from '../classes/DataPreparation';



export default class BannerController {

    private globalVariables: AppGlobalVariableInterface
    private serviceImpl: CommonCrudServiceImpl;


    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_banners_view');

    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            let condition = {};
            condition['user_id'] = request.payload['userId'];
            condition['banner_id'] = request.payload['bannerId'];
            condition['category_id'] = request.payload['categoryId'];

            response = await this.serviceImpl.getSingleEntry(condition);
            if (response.getIsSuccess()) {
                request.payload['view_count'] = response['result']['viewCount'] + 1;
                response = await this.serviceImpl.updateEntry(condition, request.payload);
            }
            else {
                request.payload['view_count'] = 1;
                response = await this.serviceImpl.createEntry(request.payload, []);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };

}