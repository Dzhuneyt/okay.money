<?php

use yii\db\Migration;



/**
 * Class m191021_193156_ALTER_TABLE_user_ADD_COLUMNS_firstname_lastname
 */
class m191021_193156_ALTER_TABLE_user_ADD_COLUMNS_firstname_lastname extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('user', 'firstname', $this->string());
        $this->addColumn('user', 'lastname', $this->string());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('user', 'firstname');
        $this->dropColumn('user', 'lastname');
    }

}
