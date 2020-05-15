import * as AWS from 'aws-sdk';
import {IEvent} from './interfaces/IEvent';
import {dynamoDbGetList} from './shared/dynamoDbGetList';

export const handler = async (event: IEvent, context: any) => {
    console.log('list accounts called', event);

    const userId = event.requestContext.authorizer.claims.sub

    try {
        const items = await dynamoDbGetList(process.env.TABLE_NAME as string, userId);
        return {
            statusCode: 200,
            body: JSON.stringify(items),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }

}
