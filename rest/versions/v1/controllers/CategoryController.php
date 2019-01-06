<?php

namespace rest\versions\v1\controllers;


use common\models\Category;
use rest\versions\shared\controllers\ActiveController;
use rest\versions\v1\actions\category\CreateAction;
use rest\versions\v1\actions\category\IndexAction;
use Yii;
use yii\db\Query;
use yii\helpers\ArrayHelper;
use yii\web\ForbiddenHttpException;

class CategoryController extends ActiveController
{
    public $modelClass = Category::class;

    private function isMyCategory($idCategory)
    {
        return (new Query())->select('owner_id')
                            ->from(Category::tableName())
                            ->where([
                                'id'       => $idCategory,
                                'owner_id' => Yii::$app->user->id,
                            ])
                            ->exists();
    }

    public function actions()
    {
        $actions = parent::actions();

        $checkAccess = function ($action, Category $model) {
            // Prevent touching other people's transaction
            if ( ! $this->isMyCategory($model->id)) {
                throw new ForbiddenHttpException();
            }
        };

        return ArrayHelper::merge($actions, [
            'create' => [
                'class'       => CreateAction::class,
                'checkAccess' => null,
            ],
            'index'  => [
                'class'       => IndexAction::class,
                'checkAccess' => null,
            ],
        ]);
    }
}