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
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" }],
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
        description: car.description
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
      id: 1
    }
  });

  const carTwo = await yaddb.get({
    TableName: "Cars",
    Key: {
      id: 2
    }
  });

  expect(carOne).toEqual({
    description: "A smooth ride",
    fuel_type: "Petrol",
    id: 1,
    manufacturer: "Toyota",
    name: "Toyota Yaris",
    type: "Automatic"
  });
  expect(carTwo).toEqual({
    description: "Good Value",
    fuel_type: "Petrol",
    id: 2,
    manufacturer: "Volkswagen",
    name: "Volkswagen Golf",
    type: "Manual"
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

  expect(allCars.length).toBe(3);
});
test("update", async () => {
  await yaddb.update({
    TableName: "Cars",
    Key: { id: 1 },
    UpdateExpression: "set #fuel_type = :fuel_type",
    ExpressionAttributeNames: { "#fuel_type": "fuel_type" },
    ExpressionAttributeValues: {
      ":fuel_type": "Hybrid"
    }
  });

  const car = await yaddb.get({
    TableName: "Cars",
    Key: {
      id: 1
    }
  });

  expect(car).toEqual({
    description: "A smooth ride",
    fuel_type: "Hybrid",
    id: 1,
    manufacturer: "Toyota",
    name: "Toyota Yaris",
    type: "Automatic"
  });
});

test("delete", async () => {
  await yaddb.delete({
    TableName: "Cars",
    Key: { id: 1 }
  });

  const car = await yaddb.get({
    TableName: "Cars",
    Key: {
      id: 1
    }
  });

  expect(car).toBeUndefined();
});
