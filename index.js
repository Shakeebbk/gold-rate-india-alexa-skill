/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = "amzn1.ask.skill.0582f6ec-1f1d-4ce9-a206-cf69928c855a";

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/lambda/data
//=========================================================================================================================================
// Scrape the website
const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
  uri: `https://www.goodreturns.in/gold-rates/`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
var rate;
var prices = [];
var cities = [];

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetGoldRateIntentCity');
    },
    'GetGoldRateIntentCity': function () {
        const obj = this;
        const intentObj = this.event.request.intent;
        // obj.response.speak("city rate");
        // obj.emit(':responseReady');
        rp(options)
          .then(($) => {
            console.log("Success");
            rate =  $('.gold_silver_table').eq(0).find('table').find('tr').eq(3).find('td').eq(1).text().split(' ')[1].replace(',', '');
            cities = $('.gold_silver_table').eq(2).find('table').find('tr');
            cities.splice(0, 1);

            for (var i = 0; i < cities.length; i++) {
                // console.log(cities.eq(i).find('td').eq(0).find('a').text());
                // console.log(cities.eq(i).find('td').eq(1).text().split(' ')[2].replace(',', ''));
                var name = cities.eq(i).find('td').eq(0).find('a').text().toLowerCase();
                var price = cities.eq(i).find('td').eq(1).text().split(' ')[2].replace(',', '');
                prices[name] = price;
            };

            var speechOutput = "22 carat Gold rate in India today is rupees " + rate +
                                 ". If you want for a particular city, please ask with the city name";
            try {
                if(intentObj.slots.place.value.toLowerCase() != "india") {
                    speechOutput = "22 carat Gold rate in "+intentObj.slots.place.value+" today is rupees " +
                                            prices[intentObj.slots.place.value.toLowerCase()];
                }
            }
            catch (err) {
                console.log(err);
            }

             obj.response.speak(speechOutput);
             obj.emit(':responseReady');
          })
          .catch((err) => {
            console.log(err);
          });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};
