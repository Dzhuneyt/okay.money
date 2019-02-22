<?php

use yii\db\Migration;

/**
 * Class m190110_070044_ALTER_TABLE_transaction_MAKE_COLUMN_category_REQUIRED
 */
class m190110_070044_ALTER_TABLE_transaction_MAKE_COLUMN_category_REQUIRED extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Failsafe
        if ($this->db->createCommand('SELECT id FROM transaction')->queryScalar()) {
            throw new \yii\db\Exception('Can not modify column transaction::category_id because it has a FK and there are some rows');
        }

        try {
            $this->dropForeignKey('transaction_to_category_id', 'transaction');
        } catch (Exception $e) {
            // We don't care if it exists. We'll add it later anyway
        }

        $this->alterColumn('transaction', 'category_id', $this->integer()->notNull());

        $this->addForeignKey(
            'transaction_to_category_id',
            'transaction',
            'category_id',
            'category',
            'id',

            // Prevent deleting category that has transactions
            // Those transactions must be first moved to a different category
            'RESTRICT',
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->alterColumn('transaction', 'category_id', $this->integer()->null());
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190110_070044_ALTER_TABLE_transaction_MAKE_COLUMN_category_REQUIRED cannot be reverted.\n";

        return false;
    }
    */
}
