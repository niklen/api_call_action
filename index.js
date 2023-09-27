const core = require('@actions/core');
const axios = require('axios');

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

try {
    const tenantId = core.getInput('tenant_id', { required: true });
    const clientId = core.getInput('client_id', { required: true });
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`

    core.getIDToken().then(token => {
        core.debug('Acquired Github Action Token')
        core.debug(parseJwt(token));

        axios.post(tokenEndpoint, {
            client_id: clientId,
            grant_type: 'client_credentials',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: token
        }, {
            headers: { 'content-type': 'application/x-www-format-urlencoded' }
        }).then(resp => {
            core.info('Sucessfully acquired Microsoft Entra Id Access Token ')
            core.setOutput('access_token', resp.data['access_token']);
            core.debug(parseJwt(response.data['access_token']))
        }).catch(err => {
            core.setFailed(`Failed to acquire Microsoft Entra Id Access token: ${err.message}`);
            core.error(err.message);

        })
    }).catch(err => {
        core.setFailed(`Failed to acquire GitHub Action Token: ${err.message}`);
        core.error(err.message);
    })
} catch (error) {

}