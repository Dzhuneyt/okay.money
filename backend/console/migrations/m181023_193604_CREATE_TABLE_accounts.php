<?php

use yii\db\Migration;

/**
 * Class m181023_193604_CREATE_TABLE_accounts
 */
class m181023_193604_CREATE_TABLE_accounts extends Migration
{
    const TABLE_NAME = 'account';

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable(self::TABLE_NAME, [
            'id'               => $this->primaryKey(),
            'name'             => $this->string(),
            'starting_balance' => $this->float(2),
            'owner_id'         => $this->integer(),
            'created_at'       => $this->integer(11),
            'updated_at'       => $this->integer(11),
        ], 'ENGINE InnoDB');

        $this->addForeignKey(
            'account_owner_id',
            self::TABLE_NAME,
            'owner_id',
            'user',
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
        $this->dropTable(self::TABLE_NAME);
    }
}
