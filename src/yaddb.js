const AWS = require('aws-sdk');
const https = process.env.NODE_ENV === 'test' ? require('http') : require('https');

const sslAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  rejectUnauthorized: true,
});
sslAgent.setMaxListeners(0);

class Yaddb {
  /**
   * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property
   */
  constructor(options) {
    AWS.config.update({
      region: options.region,
      // httpOptions: {
      //   agent: sslAgent,
      // },
    });
    this.ddb = new AWS.DynamoDB(options);
    this.docClient = new AWS.DynamoDB.DocumentClient(options);
  }

  update(params) {
    return this.docClient.update(params).promise();
  }

  put(params) {
    return this.docClient.put(params).promise();
  }

  async get(params) {
    const resolved = await this.docClient.get(params).promise();
    return resolved.Item;
  }

  delete(params) {
    return this.docClient.delete(params).promise();
  }

  async query(params) {
    const resolved = await this.docClient.query(params).promise();
    return resolved.Items;
  }

  createTable(params) {
    return this.ddb.createTable(params).promise();
  }

  deleteTable(params) {
    return this.ddb.deleteTable(params).promise();
  }

  async scan(params) {
    const resolved = await this.docClient.scan(params).promise();
    return resolved.Items;
  }

  async recursiveScan(params) {
    let promiseResults = [];
    async function innerScan(p, self) {
      const data = await self.docClient.scan(p).promise();
      promiseResults = promiseResults.concat(data.Items);
      if (data.LastEvaluatedKey) {
        return innerScan(
          {
            ...p,
            ...{ ExclusiveStartKey: data.LastEvaluatedKey },
          },
          self
        );
      }

      return promiseResults;
    }
    return innerScan(params, this);
  }
}

module.exports = options => new Yaddb(options);
