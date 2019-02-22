<?php

use yii\db\Migration;

/**
 * Class m181217_134438_ALTER_TABLE_TRANSACTION_ADD_timestamp
 */
class m181217_134438_ALTER_TABLE_TRANSACTION_ADD_timestamp extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('transaction', 'created_at', $this->integer(11));
        $this->addColumn('transaction', 'updated_at', $this->integer(11));

        $this->update('transaction', [
            'created_at' => new \yii\db\Expression('UNIX_TIMESTAMP()'),
        ], 'created_at IS NULL OR created_at=""');
        $this->update('transaction', [
            'updated_at' => new \yii\db\Expression('UNIX_TIMESTAMP()'),
        ], 'updated_at IS NULL OR updated_at=""');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('transaction', 'created_at');
        $this->dropColumn('transaction', 'updated_at');
    }

}
