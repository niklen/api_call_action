const core = require('@actions/core');
const axios = require('axios');

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

try {
    const tenantId = core.getInput('tenant_id', { required: true });
    const clientId = core.getInput('client_id', { required: true });
    const scope = core.getInput('scope', { required: true })
    const audience = core.getInput('audience', { required: false })
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    core.info(tokenEndpoint);
    core.getIDToken(audience).then(token => {
        core.debug('Acquired Github Action Token')
        core.debug(parseJwt(token));

        axios.post(tokenEndpoint, {
            scope: scope,
            client_id: clientId,
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            grant_type: 'client_credentials',
            client_assertion: token
        }, {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
        }).then(response => {
            core.info("Successfully acquired Azure AD access token!")
            core.setOutput("access_token", response.data['access_token']);
            core.exportVariable('ACCESS_TOKEN', response.data['access_token']);
            core.debug(parseJwt(response.data['access_token']))
        }).catch(({ response }) => {
            core.error(response.data)
            core.setFailed(`Failed to Acquire Azure AD JWT: ${response.data.message}`)
        })
    }).catch(err => {
        core.setFailed(`Failed to acquire GitHub Action Token: ${err.message}`);
        core.error(err.message);
    })
} catch (error) {
    core.setFailed(error.message);
}