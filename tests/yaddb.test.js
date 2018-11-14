const carsData = require("./carsData");

const yaddb = require("../src/yaddb")({
  endpoint: "http://localhost:8000",
  accessKeyId: "localAccessKey",
  secretAccessKey: "localSecretAccessKey",
  region: "localRegion"
});

beforeAll(async done => {
  await yaddb.createTable({
    TableName: "Cars",
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
      { AttributeName: "status", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "status", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  });
  carsData.forEach(async car => {
    const putParams = {
      TableName: "Cars",
      Item: {
        id: car.id,
        type: car.type,
        name: car.name,
        manufacturer: car.manufacturer,
        fuel_type: car.fuel_type,
        description: car.description,
        status: car.status
      }
    };
    await yaddb.put(putParams);
  });
  done();
});

afterAll(async done => {
  await yaddb.deleteTable({
    TableName: "Cars"
  });
  done();
});

test("get", async () => {
  const carOne = await yaddb.get({
    TableName: "Cars",
    Key: {
      id: 1,
      status: "ON_SALE"
    }
  });

  const carTwo = await yaddb.get({
    TableName: "Cars",
    Key: {
      id: 2,
      status: "ON_SALE"
    }
  });

  expect(carOne).toEqual({
    description: "A smooth ride",
    fuel_type: "Petrol",
    id: 1,
    manufacturer: "Toyota",
    name: "Toyota Yaris",
    type: "Automatic",
    status: "ON_SALE"
  });

  expect(carTwo).toEqual({
    description: "Good Value",
    fuel_type: "Petrol",
    id: 2,
    manufacturer: "Volkswagen",
    name: "Volkswagen Golf",
    type: "Manual",
    status: "ON_SALE"
  });
});

test("query", async () => {
  const retiredCars = await yaddb.query({
    TableName: "Cars",
    KeyConditionExpression: "#id = :id and #status = :status",
    ExpressionAttributeNames: {
      "#id": "id",
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":id": 4,
      ":status": "RETIRED"
    }
  });

  expect(retiredCars[0]).toEqual({
    id: 4,
    type: "Manual",
    name: "Toyota AA",
    manufacturer: "Toyota",
    fuel_type: "Petrol",
    description: "A smooth ride",
    status: "RETIRED"
  });
});

test("scan", async () => {
  const allCars = await yaddb.scan({
    TableName: "Cars",
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

  expect(allCars.length).toBe(4);
});

test("update", async () => {
  await yaddb.update({
    TableName: "Cars",
    Key: { id: 1, status: "ON_SALE" },
    UpdateExpression: "set #fuel_type = :fuel_type",
    ExpressionAttributeNames: { "#fuel_type": "fuel_type" },
    ExpressionAttributeValues: {
      ":fuel_type": "Hybrid"
    }
  });

  const car = await yaddb.get({
    TableName: "Cars",
    Key: {
      id: 1,
      status: "ON_SALE"
    }
  });

  expect(car).toEqual({
    description: "A smooth ride",
    fuel_type: "Hybrid",
    id: 1,
    manufacturer: "Toyota",
    name: "Toyota Yaris",
    type: "Automatic",
    status: "ON_SALE"
  });
});

test("delete", async () => {
  await yaddb.delete({
    TableName: "Cars",
    Key: { id: 1, status: "ON_SALE" }
  });

  const car = await yaddb.get({
    TableName: "Cars",
    Key: {
      id: 1,
      status: "ON_SALE"
    }
  });

  expect(car).toBeUndefined();
});
