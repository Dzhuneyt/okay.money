import {SSM} from 'aws-sdk';

const appName = () => `finance/${process.env.ENV_NAME}`;

export class TableNames {
    /**
     * Get the name of the "users" table
     */
    static async users() {
        const Name = `/${appName()}/table/users/name`;
        return await this.getByName(Name);
    }

    /**
     * Get the name of the "users" table
     */
    static async categories() {
        const Name = `/${appName()}/table/categories/name`;
        return await this.getByName(Name);
    }

    /**
     * Get the name of the "users" table
     */
    static async accounts() {
        const Name = `/${appName()}/table/accounts/name`;
        return await this.getByName(Name);
    }

    static async transactions() {
        const Name = `/${appName()}/table/transactions/name`;
        return await this.getByName(Name);
    }

    private static async getByName(Name: string) {
        let param;
        try {
            param = await new SSM().getParameter({
                Name,
                WithDecryption: true,
            }).promise();
        } catch (e) {
            console.error(e);
            throw new Error(`Internal error when retrieving SSM param ${Name}. Check logs`);
        }
        if (!param.Parameter || !param.Parameter.Value) {
            throw new Error(`Can not find parameter with name ${Name}`)
        }
        return param.Parameter.Value;
    }

}
