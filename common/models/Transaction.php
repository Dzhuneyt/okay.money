<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "transaction".
 *
 * @property int $id
 * @property string $description
 * @property double $sum
 * @property int $account_id
 * @property int $created_at
 * @property int $updated_at
 */
class Transaction extends \yii\db\ActiveRecord
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
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }
}
