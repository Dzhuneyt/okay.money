<?php

use yii\db\Migration;

/**
 * Class m181220_163944_CREATE_TABLE_categories
 */
class m181220_163944_CREATE_TABLE_categories extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('category', [
            'id' => $this->primaryKey(),
            'owner_id' => $this->integer(),
            'name' => $this->string(255),
            'description' => $this->text(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ]);

        $this->createIndex('category_owner_id', 'category', 'owner_id', true);

        $this->addForeignKey(
            'category_owner_id', 'category', 'owner_id',
            'user', 'id',
            'CASCADE', 'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('category');
    }
}
