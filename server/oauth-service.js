DropboxOAuth = {};

OAuth.registerService('dropbox', 2, null, function (query) {
    var response = getTokens(query);
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

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokens = function (query) {
    var config = ServiceConfiguration.configurations.findOne({ service: 'dropbox' });
    if (!config)
        throw new ServiceConfiguration.ConfigError();

    var response;
    try {
        var redirectUri = OAuth._redirectUri('dropbox', config, {}, { secure: true }).replace('?close', '?close=true');
        console.log(redirectUri);
        response = HTTP.post(
            'https://api.dropbox.com/1/oauth2/token', {
                params: {
                    code: query.code,
                    client_id: config.clientId,
                    client_secret: OAuth.openSecret(config.secret),
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                }
            });
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

var getAccountInfo = function (accessToken) {
    var hostname = 'https://api.dropboxapi.com/2/users/get_current_account';
    var options = {
        headers: { Authorization: 'Bearer ' + accessToken }
    };

    try {
        return HTTP.get(hostname, options).data;
    } catch (err) {
        throw new Error('Failed to fetch identity from dropbox. ' + err.message);
    }
};

DropboxOAuth.retrieveCredential = function (credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
};