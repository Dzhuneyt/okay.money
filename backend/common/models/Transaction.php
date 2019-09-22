<?php

namespace common\models;

use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\helpers\ArrayHelper;



/**
 * This is the model class for table "transaction".
 *
 * @property int $id
 * @property string $description
 * @property double $sum
 * @property int $account_id
 * @property int $category_id
 * @property int $created_at
 * @property int $updated_at
 * @property Account $account
 * @property Category $category
 */
class Transaction extends ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'transaction';
    }

    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            TimestampBehavior::class
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['description'], 'string'],
            [['sum'], 'number'],
            [['account_id', 'created_at', 'updated_at'], 'integer'],
            [['category_id'], 'integer', 'skipOnEmpty' => true],
            [
                ['category_id'],
                function () {
                    if (!$this->category_id) {
                        return; // Don't check null
                    }
                    $exists = Category::find()
                                      ->where([
                                          'id' => $this->category_id
                                      ])
                                      ->exists();

                    if (!$exists) {
                        $this->addError('category_id', 'Invalid category_id');
                    }
                }
            ],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'description' => 'Description',
            'sum' => 'Sum',
            'account_id' => 'Account ID',
            'category_id' => 'Category ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getCategory()
    {
        return $this->hasOne(Category::class, ['id' => 'category_id']);
    }

    public function getAccount()
    {
        return $this->hasOne(Account::class, ['id' => 'account_id']);
    }
}
