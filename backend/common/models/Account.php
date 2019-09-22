<?php

namespace common\models;

use yii\behaviors\TimestampBehavior;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "account".
 *
 * @property int $id
 * @property string $name
 * @property double $starting_balance
 * @property int $owner_id
 * @property int $created_at
 * @property int $updated_at
 */
class Account extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'account';
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
            [['owner_id', 'name'], 'required'],
            [['owner_id', 'name'], 'required'],
            [['starting_balance'], 'number'],
            [['owner_id', 'created_at', 'updated_at'], 'integer'],
            [['name'], 'string', 'max' => 255],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'starting_balance' => 'Starting Balance',
            'owner_id' => 'Owner ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function afterFind()
    {
        parent::afterFind();
        $this->starting_balance = (float)$this->starting_balance;
    }
}
