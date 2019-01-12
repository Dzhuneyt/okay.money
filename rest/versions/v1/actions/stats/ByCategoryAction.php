<?php

namespace rest\versions\v1\actions\stats;

use common\helpers\Date;
use common\models\Account;
use common\models\Category;
use common\models\Transaction;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\Query;
use yii\web\BadRequestHttpException;

/**
 * @property Date dateHelper
 */
class ByCategoryAction extends \yii\base\Action
{
    public $dateHelper;

    public function __construct(string $id, $controller, array $config = [], Date $date)
    {
        parent::__construct($id, $controller, $config);
        $this->dateHelper = $date;
    }

    private function getStartDate()
    {
        return Yii::$app->request->getQueryParam('start_date', null);
    }

    private function getEndDate()
    {
        return Yii::$app->request->getQueryParam('end_date', null);
    }

    private function getBaseQuery()
    {
        $query = (new Query())
            ->from(['t' => Transaction::tableName()])
            ->innerJoin(
                ['c' => Category::tableName()],
                't.category_id=c.id AND c.owner_id=:idUser'
            )
            ->innerJoin(
                ['a' => Account::tableName()],
                't.account_id=a.id AND a.owner_id=:idUser'
            )
            ->groupBy('category_id')
            ->indexBy('category_id')
            ->addParams([':idUser' => Yii::$app->user->id]);

        if ($this->getStartDate()) {
            Yii::error(Yii::$app->request->url);
            Yii::error($this->getStartDate());
            $query->andWhere(
                'FROM_UNIXTIME(t.created_at) > :start',
                [':start' => $this->getStartDate()]
            );
        }
        if ($this->getEndDate()) {
            $query->andWhere(
                'FROM_UNIXTIME(t.created_at) < :end',
                [':end' => $this->getEndDate()]
            );
        }

        return $query;
    }

    private function getCategoryExpenses()
    {
        $query = $this->getBaseQuery();
        $query->andWhere('t.sum<0');
        $query->select('SUM(t.sum)');

        $rows = $query->column();

        $result = [];
        foreach ($rows as $idCategory => $row) {
            $idCategory          = intval($idCategory);
            $result[$idCategory] = floatval($row);
        }

        return $result;
    }

    private function getCategoryIncomes()
    {
        $query = $this->getBaseQuery();
        $query->andWhere('t.sum>0');
        $query->select('SUM(t.sum)');

        $rows = $query->column();

        $result = [];
        foreach ($rows as $idCategory => $row) {
            $idCategory          = intval($idCategory);
            $result[$idCategory] = floatval($row);
        }

        return $result;
    }

    private function getBalancesByCategory()
    {
        $myCategories = Category::find()
                                ->andWhere(['owner_id' => Yii::$app->user->id])
                                ->select('id')
                                ->column();

//        $myAccounts = Account::find()
//            ->andWhere(['owner_id' => Yii::$app->user->id])
//            ->select('id')
//            ->column();

        $incomes  = $this->getCategoryIncomes();
        $expenses = $this->getCategoryExpenses();

        $result = [];
        foreach ($myCategories as $myCategory) {
            $income  = isset($incomes[$myCategory]) ? $incomes[$myCategory] : 0;
            $expense = isset($expenses[$myCategory]) ? $expenses[$myCategory] : 0;

            $result[] = [
                'id'                    => intval($myCategory),
                'income_for_period'     => floatval(number_format($income, 2)),
                'expense_for_period'    => floatval(number_format($expense, 2)),
                'difference_for_period' => floatval(number_format($income + $expense, 2)),
            ];
        }

        return $result;
    }

    public function run()
    {
        $this->validateParams();

        $response = [
            'categories' => $this->getBalancesByCategory(),
            'start_date' => $this->getStartDate(),
            'end_date'   => $this->getEndDate(),
        ];

        return $response;
    }

    /**
     * @return mixed|object|ActiveDataProvider
     * @throws \yii\base\InvalidConfigException
     * @deprecated
     * @TODO Delete this method
     */
    public function runExperimental()
    {

        $requestParams = Yii::$app->getRequest()->getBodyParams();
        if (empty($requestParams)) {
            $requestParams = Yii::$app->getRequest()->getQueryParams();
        }

        $filter = null;
        if ($this->dataFilter !== null) {
            $this->dataFilter = Yii::createObject($this->dataFilter);
            if ($this->dataFilter->load($requestParams)) {
                $filter = $this->dataFilter->build();
                if ($filter === false) {
                    return $this->dataFilter;
                }
            }
        }

        if ($this->prepareDataProvider !== null) {
            return call_user_func($this->prepareDataProvider, $this, $filter);
        }

        /* @var $modelClass \yii\db\BaseActiveRecord */
        $modelClass = $this->modelClass;

        $query = $modelClass::find();
        if ( ! empty($filter)) {
            $query->andWhere($filter);
        }

        return Yii::createObject([
            'class'      => ActiveDataProvider::class,
            'query'      => $query,
            'pagination' => [
                'params' => $requestParams,
            ],
            'sort'       => [
                'params' => $requestParams,
            ],
        ]);
    }

    public function validateParams()
    {
        $dateParams = [
            'start_date',
            'end_date',
        ];

        $params = Yii::$app->getRequest()->getQueryParams();

        foreach ($dateParams as $dateParam) {
            $isEmpty = empty($params[$dateParam]);
            $isValid = ! empty($params[$dateParam]) ? $this->dateHelper->isValidDate($params[$dateParam]) : false;
            if ( ! $isEmpty && ! $isValid) {
                throw new BadRequestHttpException("Invalid formatted parameter '{$dateParam}'. Please, provide a value using the format: Y-m-d H:i:s");
            }
        }
    }

}
