<?php

namespace rest\versions\v1\actions\account;


use common\models\Account;
use rest\versions\shared\helpers\AccountHelper;
use rest\versions\shared\helpers\BaseDataProvider;
use Yii;
use yii\rest\Controller;

class IndexAction extends \yii\rest\IndexAction
{

    /**
     * @var AccountHelper
     */
    private $accountHelper;

    public function __construct(string $id, Controller $controller, array $config = [])
    {
        parent::__construct($id, $controller, $config);
        $this->accountHelper = Yii::$container->get(AccountHelper::class);
    }

    protected function prepareDataProvider()
    {
        $requestParams = Yii::$app->getRequest()->getBodyParams();
        if (empty($requestParams)) {
            $requestParams = Yii::$app->getRequest()->getQueryParams();
        }

        $idUser = Yii::$app->user->id;

        $accountsBaseQuery = Account::find()
            // Get only the accounts of the current user
                                    ->andWhere(['owner_id' => $idUser]);

        $accountBallances = $this
            ->accountHelper
            ->getAccountBalancesByUser($idUser);

        return Yii::createObject([
            'class'        => BaseDataProvider::class,
            'rowFormatter' => function ($row) use ($accountBallances) {
                $row = $row->toArray();
                unset($row['owner_id']);

                if (isset($accountBallances[$row['id']])) {
                    $row['current_balance'] = floatval($row['starting_balance']) + $accountBallances[$row['id']];
                }

                return $row;
            },
            'query'        => $accountsBaseQuery,
            'pagination'   => [
                'params' => $requestParams,
            ],
            'sort'         => [
                'params' => $requestParams,
            ],
        ]);
    }

}