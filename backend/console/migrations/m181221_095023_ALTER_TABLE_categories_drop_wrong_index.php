<?php

use yii\db\Migration;

/**
 * Class m181221_095023_ALTER_TABLE_categories_drop_wrong_index
 */
class m181221_095023_ALTER_TABLE_categories_drop_wrong_index extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->dropForeignKey('category_owner_id', 'category');
        $this->dropIndex('category_owner_id', 'category');
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
        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181221_095023_ALTER_TABLE_categories_drop_wrong_index cannot be reverted.\n";

        return false;
    }
    */
}
