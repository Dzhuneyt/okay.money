<?php

namespace fixtures;


use common\models\Category;
use common\models\User;
use yii\test\ActiveFixture;

class CategoryFixture extends ActiveFixture
{
    public $modelClass = Category::class;
    public $depends = [
        UserFixture::class,
    ];

    protected function getData()
    {
        $data = parent::getData();

        // Attach the accounts to various users
        $allUserIds = User::find()->select('id')->column();
        foreach ($data as $index => $item) {
            $data[$index]['owner_id'] = $allUserIds[array_rand($allUserIds)];
        }

        return $data;
    }
}
