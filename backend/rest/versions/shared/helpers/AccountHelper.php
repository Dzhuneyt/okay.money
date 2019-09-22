<?php

namespace rest\versions\shared\helpers;


use common\models\Account;
use common\models\Transaction;
use yii\base\BaseObject;
use yii\db\Query;

class AccountHelper extends BaseObject
{
    /**
     * @param $idUser
     *
     * @return array in the format [ idAccount => float(sum) ]
     */
    public function getAccountBalancesByUser($idUser)
    {
        $myAccountIds = Account::find()
            // Get only the accounts of the current user
                               ->select('id')
                               ->andWhere(['owner_id' => $idUser])
                               ->column();

        $accountBallances = (new Query())
            ->select('a.id, SUM(t.sum) AS sum')
            ->from(['t'=>Transaction::tableName()])
            ->innerJoin(['a'=>Account::tableName()], 'a.id=t.account_id')
            ->where(['account_id' => $myAccountIds])
            ->groupBy('a.id')
            ->all();

        $findBallanceByAccountId = function ($accountId) use ($accountBallances) {
            foreach ($accountBallances as $ballanceRow) {
                if ($ballanceRow['id'] == $accountId) {
                    return floatval(number_format($ballanceRow['sum'], 2));
                }
            }

            return 0;
        };

        $res = [];
        foreach ($myAccountIds as $accountId) {
            $res[$accountId] = $findBallanceByAccountId($accountId);
        }

        return $res;
    }


}
