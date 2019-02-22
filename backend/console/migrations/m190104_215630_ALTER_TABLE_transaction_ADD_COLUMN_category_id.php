<?php

use yii\db\Migration;

/**
 * Class m190104_215630_ALTER_TABLE_transaction_ADD_COLUMN_category_id
 */
class m190104_215630_ALTER_TABLE_transaction_ADD_COLUMN_category_id extends Migration
{
    private $tableName = 'transaction';
    private $columnName = 'category_id';

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn(
            $this->tableName,
            $this->columnName,
            $this->integer()->null());

        $this->execute('ALTER TABLE category ENGINE InnoDB');

        $this->addForeignKey(
            'transaction_to_category_id',
            $this->tableName,
            $this->columnName,
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
        $this->dropColumn(
            'transaction',
            'category_id'
        );
    }
}
