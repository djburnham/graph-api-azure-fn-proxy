module.exports = function (context, req) {
    context.log('B2C Stats HTTP trigger fn processed a request.');
    
    // check if we have a client_id and client_secret header
    if (req.headers['client_secret'] && req.headers['client_id']) {
        if (req.query['statName']) {
            context.log('statName query set to ' + req.query['statName']);
            var at_request = require('request');
            var gr_request = require('request');
            var grant_type = 'client_credentials';
            var resource = 'https://graph.windows.net';
            var scope = 'https%3A%2F%2Fgraph.microsoft.com%2F.default';
            var tenant = 'contoso.onmicrosoft.com';
            var client_id = req.headers['client_id'];
            var client_secret = req.headers['client_secret'];
            // set the graph api url (gUrl) to the actual graph api to the appropriate statistic measure
            var gUrl = '';
            switch (req.query['statName']) {
                case 'B2CuserSummary':
                    context.log('statName is userSummary setting gUrl as https://graph.windows.net/contoso.onmicrosoft.com/reports/tenantUserCount?api-version=beta');
                    gUrl = 'https://graph.windows.net/contoso.onmicrosoft.com/reports/tenantUserCount?api-version=beta';
                    break;
                case 'B2CauthSummary':
                    context.log('statName is B2CauthSummary setting gUrl as https://graph.windows.net/contoso.onmicrosoft.com/reports/b2cAuthenticationCountSummary?api-version=beta');
                    gUrl = 'https://graph.windows.net/contoso.onmicrosoft.com/reports/b2cAuthenticationCountSummary?api-version=beta';
                    break;
                case 'B2CauthCount':
                    context.log('statName is B2CauthCount setting gUrl as https://graph.windows.net/contoso.onmicrosoft.com/reports/b2cAuthenticationCount?api-version=beta');
                    gUrl = 'https://graph.windows.net/contoso.onmicrosoft.com/reports/b2cAuthenticationCount?api-version=beta';
                    break;
                case 'B2CMFAreqCountSummary':
                    context.log('statName is B2CauthCount setting gUrl as https://graph.windows.net/contoso.onmicrosoft.com/reports/b2cMfaRequestCountSummary?api-version=beta');
                    gUrl = 'https://graph.windows.net/contoso.onmicrosoft.com/reports/b2cMfaRequestCountSummary?api-version=beta';
                    break;
                default:
                    //barf 
                    var errText = '*ERROR* statName query/parameter is unrecognized only B2CuserSummary, B2CauthSummary, B2CauthCount, B2CMFAreqCountSummary allowed';
                    context.log(errText);
                    var res = {
                        status: 400,
                        body: errText
                    };
                    context.done(null, res);
                    throw new Error( errText)
            }
            context.log('Finished switch construct'); //debug
            // make the POST request to get the access token
                at_request({
                url: 'https://login.windows.net/contoso.onmicrosoft.com/oauth2/token?api-version=beta',
                method: 'POST',
                form: {
                    'grant_type': grant_type,
                    'resource': resource,
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'scope': scope,
                    'tenant': tenant
                }
               }, function (error, resp) {
                    context.log('called the Auth get request callback function'); //debug
                    if (!error && resp.statusCode == 200) {
                        var json = JSON.parse(resp.body);
                        // debug context.log("response body:", json);
                        var access_token = json.access_token;
                        // should have the access token here - now we can call the graph api //
                        var gr_options = {
                            url:     gUrl,
                            "rejectUnauthorized": false,
                            headers: {
                                        'Authorization': 'Bearer ' + access_token,
                                        'Cache-control': 'no-cache'
                            },
                            method: 'GET'
                        };
                    function gr_callback(gr_error, gr_response, gr_body) {
                        context.log('called the graph api get request callback function'); //debug
                        if (!gr_error && gr_response.statusCode == 200) {
                             var res = {
                                 status: 200,
                                 body: gr_body
                                };
                            // return the context with the result 
                            context.done(null, res);
                        }
                        else {
                            context.log("Error calling graph api");
                            var res = {
                                status: 500, 
                                body: 'Error making the graph api call ' + gr_error
                            };
                            context.done(null, res);
                            throw Error('Error calling graph api');
                        }
                    } //end of gr callback function   
                    // call the graph request here
                    gr_request(gr_options, gr_callback);
                   } // closure for "if" we got a 200 back from the auth https request
                else {
                      context.log("Error getting authorization token.")
                };
            }); //end of at_request code

        }
        // end of actions to perform if we got correct auth headers and statName
        else {
            var res = {
                status: 400,
                body: "statName query/parameter not present"
            };
        }
    }
    else {
            var res = {
                status: 401,
                body: "Authorisation headers not present"
            };
        };
    };