import {DynamoDB} from 'aws-sdk';
import {Handler} from "../../../../../../lambdas/shared/Handler";
import {IEvent} from "../../../../../../lambdas/interfaces/IEvent";

async function getTokenItem(token: string) {
    try {
        const Item = await new DynamoDB().getItem({
            TableName: process.env.TABLE_NAME_TOKENS as string,
            Key: DynamoDB.Converter.marshall({
                id: token,
            }),
            ConsistentRead: true,
        }).promise();
        console.log(Item);
        return Item.Item ? DynamoDB.Converter.unmarshall(Item.Item) as {
            id: string,
            email: string,
            expires: number,
        } : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export const handler = new Handler(async (event: IEvent) => {
    try {
        const tokenFromDB = event.queryStringParameters.token
            ? await getTokenItem(event.queryStringParameters.token)
            : undefined;

        if (!tokenFromDB) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Invalid token. The link may have expired',
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                id: tokenFromDB!.id,
                email: tokenFromDB!.email,
            })
        };
    } catch (e: any) {
        console.log('Failed to check token validity');
        console.log(e);
        return {
            statusCode: 500,
            body: JSON.stringify({message: e.toString()}),
        }
    }
}).create();
