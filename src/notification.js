const cron = require("node-cron");
const express = require("express");
let nodemailer = require("nodemailer");

app = express();

// schedule tasks to be run on the server
cron.schedule("2 * * * * *", function() {


            let date_ob = new Date().valueOf()+172800
            var timestamp = date_ob / 1000
            console.log(timestamp)
            let ExpiryNotificationquery = "select * from t_advertisement where end_date_time <= "+timestamp
            response = this.tAdvertisementServiceImpl.rawQueryOnDb(ExpiryNotificationquery);
    
            if (response.getIsSuccess()) {
                let result = response.getResult();

                for (let i = 0; i < result.length; i++)
                 {
                  console.log(result[i]["userId"])
                  let condition2 = {};
                  condition2['isActive'] = 1;
                  condition2['isDeleted'] = 0;
                //   condition2['id'] = 56;
                condition2['id'] = result[i]["userId"];
                  let receiverUsersResponse = this.tUsersServiceImpl.getSingleEntry(condition2); 
                  let tokens = receiverUsersResponse['result']["fcmToken"]
                  console.log("tokens")
                  console.log(tokens)
                  let condition4 = {};
                  condition4['id'] = result[i]['id'];
                  condition4['bookmarkUserId'] = result[i]["userId"];

                  let isBookmarkedResponse =  this.bookmarkViewServiceImpl.getSingleEntry(condition4);
                  let bookmark = isBookmarkedResponse.getIsSuccess() == true ? 1 : 0;
                  let data = {
                          "type" : 2,
                          "title": "Renew advertisement plan",
                          "body" : "Your advertise is getting expired in next two days. Please renew the plan.",
                          "advertise_id" : result[i]["id"],
                          "details":{
                                     "id" : result[i]["id"],
                                     "categoryId": result[i]["categoryId"],
                                     "status": "category",
                                     "adType": 1,
                                     "isBookmarked" : bookmark
                                    }
                              }
                          
                  let r = this.fcmNotificationsForJqp.sendIndividualNotification(data, tokens);
                 let happy={}
                  happy['typeOfNotification'] = data['type'];
                  happy['title'] = data['title'];
                  happy['description'] = data['body'];
                  happy['details'] = data['details'];
                  happy['user_id'] = condition2['id'];
                  response = this.tNotificationServiceImpl.createEntry(happy, []);
                  console.log(response)
              
  


app.listen(3128);

