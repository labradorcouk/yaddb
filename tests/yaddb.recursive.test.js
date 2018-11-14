const yaddb = require("../src/yaddb")({
  endpoint: "http://localhost:8000",
  accessKeyId: "localAccessKey",
  secretAccessKey: "localSecretAccessKey",
  region: "localRegion"
});

const carDesc = require("./carDesc");

beforeAll(async done => {
  jest.setTimeout(10 * 1000);
  await yaddb.createTable({
    TableName: "FunkyCars",
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
      { AttributeName: "status", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "status", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 100,
      WriteCapacityUnits: 500
    }
  });

  for (let i = 1; i <= 20; i += 1) {
    const putParams = {
      TableName: "FunkyCars",
      Item: {
        id: i,
        type: `type-${i}`,
        name: `name-${i}`,
        manufacturer: `manufacturer-${i}`,
        fuel_type: "electric",
        description: carDesc.desc,
        status: `ON_SALE`
      }
    };
    // eslint-disable-next-line no-await-in-loop
    await yaddb.put(putParams);
  }
  done();
});

afterAll(async done => {
  await yaddb.deleteTable({
    TableName: "FunkyCars"
  });
  done();
});

test("recursiveScan", async () => {
  const allCars = await yaddb.recursiveScan({
    TableName: "FunkyCars",
    ProjectionExpression:
      "#id, #name, #type, #manufacturer, #fuel_type, #description",
    ExpressionAttributeNames: {
      "#id": "id",
      "#name": "name",
      "#type": "type",
      "#manufacturer": "manufacturer",
      "#fuel_type": "fuel_type",
      "#description": "description"
    }
  });

  expect(allCars.length).toBe(20);
});
