import {SSM} from 'aws-sdk';

const appName = () => `finance/${process.env.ENV_NAME}`;

export class TableNames {

    static cache = new Map<string, string>();

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
        const Name = `/${appName()}/table/category/name`;
        return await this.getByName(Name);
    }

    /**
     * Get the name of the "users" table
     */
    static async accounts() {
        const Name = `/${appName()}/table/account/name`;
        return await this.getByName(Name);
    }

    static async transactions() {
        const Name = `/${appName()}/table/transaction/name`;
        return await this.getByName(Name);
    }

    private static async getByName(Name: string) {
        if (!this.cache.has(Name)) {
            let param = await new SSM().getParameter({
                Name,
                WithDecryption: true,
            }).promise();

            if (!param.Parameter || !param.Parameter.Value) {
                throw new Error(`Can not find parameter with name ${Name}`)
            }
            this.cache.set(Name, param.Parameter.Value);
        }

        return this.cache.get(Name) as string;
    }

}
