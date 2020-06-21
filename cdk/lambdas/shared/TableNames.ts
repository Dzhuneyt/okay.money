import {SSM} from 'aws-sdk';

export class TableNames {

    /**
     * Get the name of the "users" table
     */
    static async users() {
        const ssm = new SSM();
        const Name = '/personalfinance/table/users/name';
        const param = await ssm.getParameter({
            Name,
            WithDecryption: true,
        }).promise();
        if (!param.Parameter || !param.Parameter.Value) {
            throw new Error(`Can not find parameter with name ${Name}`)
        }
        return param.Parameter.Value;
    }

    /**
     * Get the name of the "users" table
     */
    static async categories() {
        const ssm = new SSM();
        const Name = '/personalfinance/table/categories/name';
        const param = await ssm.getParameter({
            Name,
            WithDecryption: true,
        }).promise();
        if (!param.Parameter || !param.Parameter.Value) {
            throw new Error(`Can not find parameter with name ${Name}`)
        }
        return param.Parameter.Value;
    }


    /**
     * Get the name of the "users" table
     */
    static async accounts() {
        const ssm = new SSM();
        const Name = '/personalfinance/table/accounts/name';
        const param = await ssm.getParameter({
            Name,
            WithDecryption: true,
        }).promise();
        if (!param.Parameter || !param.Parameter.Value) {
            throw new Error(`Can not find parameter with name ${Name}`)
        }
        return param.Parameter.Value;
    }
}
