import {IEvent} from '../interfaces/IEvent';
import {Handler} from '../shared/Handler';

export const handler = new Handler((event: IEvent) => {
    const response = {
        'categories': [
            {
                id: "123",
                name: "Bla",
                income_for_period: 13,
                expense_for_period: -25,
                difference_for_period: 13 + -25,
            },
            {
                id: "124",
                name: "Bla2",
                income_for_period: 1,
                expense_for_period: -10,
                difference_for_period: -9,
            }
        ]
    }
    return {
        statusCode: 200,
        body: JSON.stringify(response)
    }
}).create();
