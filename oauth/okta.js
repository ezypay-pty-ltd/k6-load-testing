import http from 'k6/http';
import encoding from 'k6/encoding';

/**
 * Authenticate using OAuth against Okta
 * @function
 * @param  {string} oktaDomain - Okta domain to authenticate against
 * @param  {string} authServerId - Authentication server identifier
 * @param  {string} clientId
 * @param  {string} clientSecret
 * @param  {string} scope - Space-separated list of scopes
 * @param  {string|object} resource - Either a resource ID (as string) or an object containing username and password
 */
export function authenticateUsingOkta(
    oktaDomain,
    authServerId,
    clientId,
    clientSecret,
    scope,
    resource
) {
  if (authServerId === 'undefined' || authServerId == '') {
    authServerId = 'default';
  }
  const url = `https://${oktaDomain}.${authServerId}/token`;
  const requestBody = { scope: scope };
  let response;

  if (typeof resource == 'string') {
    requestBody['grant_type'] = 'client_credentials';

    const encodedCredentials = encoding.b64encode(`${clientId}:${clientSecret}`);
    const params = {
      auth: 'basic',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    };

    response = http.post(url, requestBody, params);
  } else if (
      typeof resource == 'object' &&
      resource.hasOwnProperty('username') &&
      resource.hasOwnProperty('password')
  ) {
    requestBody['grant_type'] = 'password';
    requestBody['username'] = resource.username;
    requestBody['password'] = resource.password;
    requestBody['client_id'] = clientId;
    requestBody['client_secret'] = clientSecret;

    response = http.post(url, requestBody);
  } else {
    throw 'resource should be either a string or an object containing username and password';
  }

  return response.json();
}
