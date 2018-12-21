<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "category".
 *
 * @property int $id
 * @property int $owner_id
 * @property string $name
 * @property string $description
 * @property int $created_at
 * @property int $updated_at
 *
 * @property User $owner
 */
class Category extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'category';
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
            [['owner_id', 'created_at', 'updated_at'], 'integer'],
            [['description'], 'string'],
            [['name'], 'required'],
            [['name'], 'string', 'max' => 255],
            [
                ['owner_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['owner_id' => 'id']
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
            'owner_id' => 'Owner ID',
            'name' => 'Name',
            'description' => 'Description',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getOwner()
    {
        return $this->hasOne(User::className(), ['id' => 'owner_id']);
    }
}
