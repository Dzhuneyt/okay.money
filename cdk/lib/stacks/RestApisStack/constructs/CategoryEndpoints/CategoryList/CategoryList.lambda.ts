import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

const originalHandler = async (event: IEvent) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const items = await new DynamoManager(await TableNames.categories())
            .forUser(userId)
            .list();

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
export const handler = new Handler(originalHandler).create();
