import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import schema from "../shared/types.schema.json";
const client = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {

  if(!event.pathParameters){
    return {
      statusCode: 404,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    };

  }
  const cinemaId = event.pathParameters["cinemaId"] || null

  if(cinemaId == null){
    if(!event.pathParameters){
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      };
  
    }

  }

  const commandInput: QueryCommandInput = {
    TableName: "CinemaTable",
    KeyConditionExpression: "cinemaId = :mid",
    ExpressionAttributeValues: {
      ":mid": parseInt(cinemaId!!)
    },
  };
  

  try {
    const response = await client.send(new QueryCommand(commandInput))
    let items
    if(response.Items){

      items = response.Items


      if(event.queryStringParameters && event.queryStringParameters["period"]){
        const date = event.queryStringParameters["period"]

        items = items.filter( item => item.period = date )
          
      }

      if(event.queryStringParameters && event.queryStringParameters["movieId"]){
        const movieId = event.queryStringParameters["movieId"]

        items = items.filter( item => item.movieId ==movieId )

        if(event.queryStringParameters["period"]){

        }


      
      }

      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({items}),
      };


    }
    

    console.log("Event: ", JSON.stringify(event));
 
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
