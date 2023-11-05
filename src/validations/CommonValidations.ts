import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/ValidationsInterface";
import { join } from "path";

export const getAllApiQueryParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "is_admin": Joi.number(),
    "filters": Joi.object()
});

export const getAllApiQueryParams1: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "is_admin": Joi.number(),
    "is_advertise": Joi.number(),
    "filters": Joi.object()
});

export const idInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "id": Joi.string().required()
})


export const categoryIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "categoryId": Joi.string().required()

})

export const userIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "userId": Joi.string().required()
})


export const idAndUserIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "id": Joi.string().required(),
    "userId": Joi.string().required()
})


export const idAndCategoryInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "id": Joi.string().required(),
    "categoryId": Joi.string().required()
})


export const loginModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "email": Joi.string(),
    "mobile": Joi.string(),
    "password": Joi.string().required(),
});


// Chat
export const senderIdAndRecieverIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "senderId": Joi.string().required(),
    "receiverId": Joi.string().required()
})


export const createChatModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "message": Joi.string().required(),
});

// User Validations

export const createUsersModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "name": Joi.string(),
    "mobile": Joi.string(),
    "email": Joi.string(),
    "userRole": Joi.number().default(0),
    "fcmToken": Joi.string().required(),
    'gmailId': Joi.string(),
    'facebookId': Joi.string(),
    "image": Joi.string(),
    "gender" : Joi.number().default(-1),
    "password": Joi.string(),
    
});

export const updateUsersModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "name": Joi.string().required(),
    "mobile": Joi.string().required(),
    "email": Joi.string().required(),
    "image": Joi.string(),
    "gender" : Joi.number(),
});


export const forgotPasswordModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "email": Joi.string().required().email(),
});


export const updatePasswordModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "email": Joi.string().required().email(),
    "token": Joi.string().required(),
    "password": Joi.string().required(),
});



export const verifyEmailModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "email": Joi.string().required().email(),
    "token": Joi.string().required()
});

export const verifyOtpModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "mobile": Joi.string().required(),
    "otp": Joi.number().required(),
});

// Language
export const createUpdateLanguage: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "name": Joi.string().required(),
    "image": Joi.string(),
    "isActive": Joi.number().default(1),
    "sequenceNumber": Joi.number().default(1),
});


// 

export const notificationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "title": Joi.string().required(),
    "description": Joi.string().required(),
    "categoryId": Joi.number(),
});


// 

export const createSubscriptionEntry: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "name": Joi.string().required(),
    "isAdvertisement": Joi.number().default(1),
    "noOfDays": Joi.number().default(0),
    "price": Joi.number().default(0)
});


// Category Validations

export const createUpdateCategory: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "name": Joi.string().required(),
    "image": Joi.string(),
    "isActive": Joi.number().default(1),
    "sequenceNumber": Joi.number().default(1),
});

export const createPriceImageValidations: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "image": Joi.string()
    
});


export const createPaymentGatewayLogEntry: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "planIdAdvertise": Joi.number().required(),
    "planIdBanner": Joi.number().required(),
    "advertisementId": Joi.number().required(),
    "userId": Joi.number().required(),
    "paymentId": Joi.string().required(),
    "isSuccess": Joi.number().required(),
    "advertisementStartDate": Joi.date(),
    "advertisementEndDate": Joi.date(),
    "bannerStartDate": Joi.date(),
    "bannerEndDate": Joi.date(),
    "amount": Joi.number()
});


// Banner


export const createUpdateBanners: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "image": Joi.string(),
    "title": Joi.string(),
    "description": Joi.string(),
    "lat": Joi.number(),
    "lng": Joi.number(),
    "isActive": Joi.number().default(1),
    "startDateTime": Joi.number().required(),
    "endDateTime": Joi.number().required(),
    "city": Joi.string().required(),

    "advertisementId": Joi.number().required(),
    "userId": Joi.number().required(),

});


// Advertisement

export const createUpdateAdvertisement: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "categoryId": Joi.number(),
    "images": Joi.array().items(Joi.string()),
    "isActive": Joi.number().default(1),
    "startDateTime": Joi.number().required(),
    "endDateTime": Joi.number().required(),

    "title": Joi.string().required(),
    "description": Joi.string(),
    "price": Joi.number(),


    "latitude": Joi.number(),
    "longitude": Joi.number(),
    "address": Joi.string(),

    "gender": Joi.number().default(1),
    "languages": Joi.array().items(Joi.string()),

    "email": Joi.string().required(),
    "mobile": Joi.string().required(),

    "countryCode": Joi.string(),
    "extraFields": Joi.object(),

    "subCategoryId": Joi.number(),
    "tags": Joi.array().items(Joi.string()),

    "adPriceType" : Joi.number(),
    "city" : Joi.string()


});




export const createUpdateAdvertisementFromAdmin: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "userId": Joi.number(),

    "categoryId": Joi.number(),
    "images": Joi.array().items(Joi.string()),
    "isActive": Joi.number().default(1),
    "startDateTime": Joi.number().required(),
    "endDateTime": Joi.number().required(),

    "title": Joi.string().required(),
    "description": Joi.string(),
    "price": Joi.number(),


    "latitude": Joi.number(),
    "longitude": Joi.number(),
    "address": Joi.string(),

    "gender": Joi.number().default(1),
    "languages": Joi.array().items(Joi.string()),

    "email": Joi.string().required(),
    "mobile": Joi.string().required(),

    "countryCode": Joi.string(),
    "extraFields": Joi.object(),

    "subCategoryId": Joi.number(),
    "tags": Joi.array().items(Joi.string()),
    
    "adPriceType" : Joi.number(),
    "city" : Joi.string()

});


export const verifyMobile: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "mobile": Joi.string().required(),
    "otp" : Joi.string().required(),
    "isResend" : Joi.number()
});



export const createBookMarkModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "userId": Joi.string().required()
});



export const createRatingsNReviewModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "userId": Joi.string().required(),
    "ratings": Joi.number(),
    "review": Joi.string()
});


export const headersValidations: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "authorization": Joi.string().required()
}).unknown(true);


export const categoryIdInParamsAndsubcategoryIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "categoryId": Joi.string().required(),
    "subcategoryId": Joi.string().required()

})

export const adminNotificationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
   
    "type": Joi.number().required(),
    "title": Joi.string().required(),
    "body": Joi.string().required(),
    "advertise_id": Joi.number(),
    "details" : Joi.object()
});



export const userIdcategoryIdbannerIdInModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "categoryId": Joi.number().required(),
    "userId": Joi.number().required(),
    "bannerId": Joi.number().required()
   

})


export const advertisementsIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "advertisementsId": Joi.number().required()
})

export const bannersIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "bannersId": Joi.number().required()
})

// Resone
export const createUpdateresone: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "advertiseId": Joi.number(),	
    "bannerId": Joi.number(),
    "reason": Joi.string()
});

export const getAllApiQueryParams3: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "is_admin": Joi.number(),
    "is_advertise": Joi.number(),
    "latitude": Joi.number(),
    "longitude": Joi.number(),
    "language":Joi.string(),
    "city":Joi.string(),
    "distance": Joi.number(),
    "filters": Joi.object(),
});

export const getSingleApiQueryParams3: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "language":Joi.string()
});

export const headersModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    authorization: Joi.string().required()
    }).options({ allowUnknown: true })
    
