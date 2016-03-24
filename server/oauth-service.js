DropboxOAuth = {};

OAuth.registerService('dropbox', 2, null, function (query) {
    var response = getTokens(query.code);
    var accessToken = response.accessToken;
    var accountInfo = getAccountInfo(accessToken);

    var serviceData = {
        id: accountInfo.account_id,
        accessToken: accessToken,
        expiresAt: (+new Date()) + (1000 * response.expiresIn || 0)
    };

    _.extend(serviceData, {
        display_name: accountInfo.name.display_name,
        country: accountInfo.country,
        email: accountInfo.email
    });

    return {
        serviceData: serviceData,
        options: {
            profile: { name: accountInfo.name.display_name }
        }
    };
});

/**
 * Exchange OAuth code to access tokens
 * @param {String} code OAuth grant code
 * @returns {{accessToken: {String}, expiresIn: *}}
 */
var getTokens = function (code) {
    var response;
    var config = ServiceConfiguration.configurations.findOne({ service: 'dropbox' });
    if (!config) throw new ServiceConfiguration.ConfigError();

    try {
        var redirectUri = OAuth._redirectUri('dropbox', config, {}, { secure: true }).replace('?close', '?close=true');
        var hostname = 'https://api.dropbox.com/1/oauth2/token';
        var options = {
            params: {
                code: code,
                client_id: config.clientId,
                client_secret: OAuth.openSecret(config.secret),
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }
        };
        response = HTTP.post(hostname, options);
    } catch (err) {
        throw _.extend(new Error('Failed to complete OAuth handshake with Dropbox. ' + err.message),
            { response: err.response });
    }

    if (response.data.error) { // if the http response was a json object with an error attribute
        throw new Error('Failed to complete OAuth handshake with Dropbox. ' + response.data.error);
    } else {
        return {
            accessToken: response.data.access_token,
            expiresIn: response.data.expires_in
        };
    }
};

/**
 * Fetch the Dropbox account info
 * @param {String} accessToken Dropbox valid access token
 * @returns {Object} https://www.dropbox.com/developers/documentation/http/documentation#users-get_current_account
 */
var getAccountInfo = function (accessToken) {
    var hostname = 'https://api.dropboxapi.com/2/users/get_current_account';
    var options = {
        headers: { Authorization: 'Bearer ' + accessToken }
    };

    try {
        return HTTP.post(hostname, options).data;
    } catch (err) {
        throw new Error('Failed to fetch identity from dropbox. ' + err.message);
    }
};

DropboxOAuth.retrieveCredential = function (credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
