<?php

namespace fixtures;


use common\models\Account;
use common\models\Category;
use common\models\Transaction;
use yii\test\ActiveFixture;

class TransactionFixture extends ActiveFixture
{
    public $modelClass = Transaction::class;
    public $depends = [
        UserFixture::class,
        AccountFixture::class,
        CategoryFixture::class,
    ];

    protected function getData()
    {
        $data = parent::getData();

        // Attach the accounts to various users
        $allCategories = Category::find()->all();

        foreach ($data as $index => $item) {
            $randomCategory = $allCategories[array_rand($allCategories)];

            $randomUserAccountId = Account::find()
                ->where([
                    'owner_id' => $randomCategory->owner->id,
                ])
                ->select('id')
                ->orderBy('RAND()')
                ->scalar();

            $data[$index]['account_id'] = $randomUserAccountId;
            $data[$index]['category_id'] = $randomCategory->id;
        }

        return $data;
    }
}
