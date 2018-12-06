<?php

use yii\db\Migration;

/**
 * Class m181108_145753_CREATE_TABLE_transaction
 */
class m181108_145753_CREATE_TABLE_transaction extends Migration
{
    private static $TABLE_NAME = 'transaction';

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable(self::$TABLE_NAME, [
            'id'          => $this->primaryKey()->notNull(),
            'description' => $this->text()->null(),
            'sum'         => $this->float(2)->notNull(),
            'account_id'  => $this->integer()->notNull(),
        ], 'ENGINE InnoDB');
        $this->addForeignKey(
            'transaction_to_account',
            self::$TABLE_NAME,
            'account_id',
            'account',
            'id',
            'CASCADE',
            'CASCADE'
        );

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable(self::$TABLE_NAME);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181108_145753_CREATE_TABLE_transaction cannot be reverted.\n";

        return false;
    }
    */
}
