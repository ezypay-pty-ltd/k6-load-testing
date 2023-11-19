import http from 'k6/http';
import { check } from 'k6';
import { authenticateUsingOkta } from './oauth/okta.js';

const USERNAME = 'postman_tester@ezypay.com';
const PASSWORD = 'I_love_postm@n123';
const OKTA_CLIENT_ID = '0oajgazy3wo83NOW30h7';
const OKTA_CLIENT_SECRET = '9fTWdFQ-06AQeVVQgeou5eF62RU9MwlaySQ7vePN';
const OKTA_DOMAIN = 'identity-sandbox';
const OKTA_AUTH_SERVER_ID = 'ezypay.com';
const OKTA_SCOPES = 'billing_internal finance_profile support_profile billing_profile hosted_payment pos_profile create_payment_method offline_access';

export const options = {
  vus: 200,
  duration: '60s',
};

export function setup() {
  // Okta OAuth password authentication flow
  let oktaPassAuth = authenticateUsingOkta(OKTA_DOMAIN, OKTA_AUTH_SERVER_ID, OKTA_CLIENT_ID, OKTA_CLIENT_SECRET, OKTA_SCOPES,
  {
      username: USERNAME,
      password: PASSWORD
  });
  // This should print the authentication tokens
  console.log(JSON.stringify(oktaPassAuth));
  return oktaPassAuth;
}

export default function (data) {
  // Then, use the access_token to access a protected resource
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'merchant': 'ab4d01dd-f0f9-47c4-8ca0-87dce0e6c9e2',
      'Authorization': `Bearer ${data.access_token}`,
    },
  };
  const userProfileUrl = 'https://api-sandbox.ezypay.com/v2/ledger/outstanding/merchant?merchantId=ab4d01dd-f0f9-47c4-8ca0-87dce0e6c9e2';
  const res = http.get(userProfileUrl, params);

  // Verify the response
  check(res, {
    'Status is 200': (r) => r.status === 200
  });
  console.log(JSON.stringify(res.json()));
}
