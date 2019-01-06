<?php

namespace rest\versions\v1\actions\transaction;


use common\models\Account;
use common\models\Category;
use Yii;
use yii\db\ActiveRecord;
use yii\helpers\Url;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\ServerErrorHttpException;

class CreateAction extends \yii\rest\CreateAction
{

    private function validateParams($params = [])
    {
        if (empty(Yii::$app->request->getBodyParam('account_id'))) {
            throw new BadRequestHttpException('Invalid parameter "account_id"');
        }

        if (empty($params['sum']) || floatval($params['sum']) <= 0) {
            throw new BadRequestHttpException('Invalid parameter "sum"');
        }
        if ( ! empty($params['category_id'])) {
            $categoryId = $params['category_id'];
            $category   = Category::findOne($categoryId);
            if ( ! $category) {
                throw new BadRequestHttpException('Invalid parameter "category_id"');
            }
        }
    }

    private function checkAccess()
    {
        $idUser    = Yii::$app->user->id;
        $idAccount = Yii::$app->request->getBodyParam('account_id');
        if ( ! $this->doesUserOwnAccount($idUser, $idAccount)) {
            throw new ForbiddenHttpException(
                'Can not create transactions in this account'
            );
        }

        $idCategory = Yii::$app->request->getBodyParam('category_id');
        if ( ! empty($idCategory)) {
            // Null is valid value, so only check if not null
            if ( ! $this->doesUserOwnCategory($idUser, $idCategory)) {
                throw new ForbiddenHttpException(
                    'Can not create transactions in this category'
                );
            }
        }
    }

    public function run()
    {
        $this->checkAccess();

        $params = \Yii::$app->request->getBodyParams();
        $this->validateParams($params);

        /* @var $model Account */
        $model = $this->createModel();

        $params = Yii::$app->getRequest()->getBodyParams();

        $model->load($params, '');
        if ($model->save()) {
            $model->refresh();
            $this->handleSuccess($model);
        } elseif ( ! $model->hasErrors()) {
            $this->handleError();
        }

        return $model;
    }

    private function doesUserOwnAccount($idUser, $idAccount): bool
    {
        $account = Account::findOne($idAccount);

        return $account && intval($account->owner_id) === intval($idUser);
    }

    private function doesUserOwnCategory($idUser, $idCategory): bool
    {
        return Category::find()
                       ->where([
                           'id'       => $idCategory,
                           'owner_id' => $idUser,
                       ])
                       ->exists();
    }

    private function createModel()
    {
        return new $this->modelClass([
            'scenario' => $this->scenario,
        ]);
    }

    public function handleError()
    {
        throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
    }

    public function handleSuccess(ActiveRecord $model)
    {
        $response = Yii::$app->getResponse();
        $response->setStatusCode(201);
        $response->getHeaders()->set('Location', Url::toRoute([$this->viewAction, 'id' => $model->id], true));
    }

}