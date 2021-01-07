import {DynamoManager} from './DynamoManager';

export async function isOwnedBy(id: string, idOwner: string, tableName: string) {
    return !!(await new DynamoManager(tableName)
        .forUser(idOwner).getOne(id));
}
