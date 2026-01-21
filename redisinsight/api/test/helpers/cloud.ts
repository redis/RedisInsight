import { constants } from './constants';
import * as request from 'supertest';
import * as _ from 'lodash';

export const initCloudDatabase = async () => {
  let subscription = await getSubscriptionByName(
    constants.TEST_CLOUD_SUBSCRIPTION_NAME,
  );
  let startTime;
  let ttlThreshold;

  // create subscription with database
  if (!subscription) {
    const paymentMethodId = await getPaymentMethod();

    if (!paymentMethodId) {
      throw new Error("Cloud Account isn't configured well");
    }

    await createSubscription({
      name: constants.TEST_CLOUD_SUBSCRIPTION_NAME,
      paymentMethodId: paymentMethodId,
      cloudProviders: [
        {
          regions: [
            {
              region: 'us-east-1',
              networking: {
                deploymentCIDR: '10.0.0.0/24',
              },
            },
          ],
        },
      ],
      databases: [
        {
          name: constants.TEST_CLOUD_DATABASE_NAME,
          memoryLimitInGb: 1,
        },
      ],
    });

    ttlThreshold = 5 * 60 * 1000; // 5 min to wait for pending or active status
    startTime = Date.now();
    while (
      (!subscription || !['pending', 'active'].includes(subscription.status)) &&
      Date.now() - startTime < ttlThreshold
    ) {
      subscription = await new Promise((resolve) => {
        setTimeout(
          async () => {
            const subscription = await getSubscriptionByName(
              constants.TEST_CLOUD_SUBSCRIPTION_NAME,
            );
            console.log(
              `Waiting for pending or active subscriptions ${(Date.now() - startTime) / 1000}s: `,
            );
            resolve(subscription);
          },
          +(Date.now() - startTime > 1000) * 20000,
        ); // execute each 20 sec
      });
    }
  }

  constants.TEST_CLOUD_SUBSCRIPTION_ID = subscription.id;

  switch (subscription.status) {
    case 'pending':
      ttlThreshold = 20 * 60 * 1000; // !!! 20 min to wait for active status
      startTime = Date.now();
      while (
        subscription.status !== 'active' &&
        Date.now() - startTime < ttlThreshold
      ) {
        subscription = await new Promise((resolve) => {
          setTimeout(
            async () => {
              const subscription = await getSubscriptionByName(
                constants.TEST_CLOUD_SUBSCRIPTION_NAME,
              );
              console.log(
                `Waiting for active subscriptions ${(Date.now() - startTime) / 1000}s: `,
              );
              resolve(subscription);
            },
            +(Date.now() - startTime > 1000) * 20000,
          ); // execute each 20 sec
        });
      }
      if (subscription.status !== 'active') {
        throw new Error(
          'Timeout exceeded when waiting for subscription "active" status',
        );
      }
    case 'active':
      let database = await getDatabaseByName(
        constants.TEST_CLOUD_SUBSCRIPTION_ID,
        constants.TEST_CLOUD_DATABASE_NAME,
      );

      if (!database) {
        throw new Error('Error when fetching database');
      }

      startTime = Date.now();
      ttlThreshold = 5 * 60 * 1000; // !!! 5 min to wait for database public endpoint
      while (
        !database.publicEndpoint &&
        Date.now() - startTime < ttlThreshold
      ) {
        database = await new Promise((resolve) => {
          setTimeout(
            async () => {
              const database = await getDatabaseByName(
                constants.TEST_CLOUD_SUBSCRIPTION_ID,
                constants.TEST_CLOUD_DATABASE_NAME,
              );
              console.log(
                `Waiting for database public endpoint ${(Date.now() - startTime) / 1000}s: `,
              );
              resolve(database);
            },
            +(Date.now() - startTime > 1000) * 5000,
          ); // execute each 5 sec
        });
      }

      const [host, port] = database.publicEndpoint.split(':');
      constants.TEST_REDIS_HOST = host;
      constants.TEST_REDIS_PORT = +port;
      constants.TEST_REDIS_PASSWORD = database.security.password;
      break;
    default:
      throw new Error(`Unexpected subscription status: ${subscription.status}`);
  }
};

const getSubscriptionByName = async (name) => {
  const { body } = await request(constants.TEST_CLOUD_API)
    .get('/subscriptions')
    .set('x-api-key', constants.TEST_CLOUD_API_KEY)
    .set('x-api-secret-key', constants.TEST_CLOUD_API_SECRET_KEY)
    .expect(200);

  return _.find(body.subscriptions, { name });
};

const getDatabaseByName = async (subscriptionId, databaseName) => {
  const { body } = await request(constants.TEST_CLOUD_API)
    .get(`/subscriptions/${subscriptionId}/databases`)
    .set('x-api-key', constants.TEST_CLOUD_API_KEY)
    .set('x-api-secret-key', constants.TEST_CLOUD_API_SECRET_KEY)
    .expect(200);

  const subscription = _.find(body.subscription, { subscriptionId });

  if (!subscription) {
    throw new Error(`There is no subscription with such id`);
  }

  const database = _.find(subscription.databases, { name: databaseName });
  if (!database) {
    throw new Error(
      `There is no database with name ${databaseName} in subscription ${subscriptionId}`,
    );
  }
  const { body: fullDatabaseInfo } = await request(constants.TEST_CLOUD_API)
    .get(`/subscriptions/${subscriptionId}/databases/${database.databaseId}`)
    .set('x-api-key', constants.TEST_CLOUD_API_KEY)
    .set('x-api-secret-key', constants.TEST_CLOUD_API_SECRET_KEY)
    .expect(200);

  return fullDatabaseInfo;
};

const getPaymentMethod = async () => {
  const { body } = await request(constants.TEST_CLOUD_API)
    .get('/payment-methods')
    .set('x-api-key', constants.TEST_CLOUD_API_KEY)
    .set('x-api-secret-key', constants.TEST_CLOUD_API_SECRET_KEY)
    .expect(200);

  return body.paymentMethods.length ? body.paymentMethods[0].id : null;
};

const createSubscription = async (data) => {
  return request(constants.TEST_CLOUD_API)
    .post('/subscriptions')
    .send(data)
    .set('x-api-key', constants.TEST_CLOUD_API_KEY)
    .set('x-api-secret-key', constants.TEST_CLOUD_API_SECRET_KEY)
    .expect(202);
};
