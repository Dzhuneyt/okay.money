<?php

namespace rest\versions\v1\actions\user;

use common\models\Login;
use common\models\User;
use Yii;
use yii\rest\Action;



class ProfileAction extends Action
{
    public $modelClass = User::class;

    public function run()
    {
        // Input parameters
        // full_name
        // email
        // password + old_password

        $newEmail = \Yii::$app->getRequest()
                              ->getBodyParam('email', null);
        $oldPassword = \Yii::$app->getRequest()
                                 ->getBodyParam('old_password', null);
        $newPassword = \Yii::$app->getRequest()
                                 ->getBodyParam('new_password', null);

        if ($newEmail !== null && $newEmail != Yii::$app->user->identity->email) {
            Yii::$app->user->identity->email = $newEmail;
            // @TODO send confirmation email
        }

        if ($oldPassword !== null && $newPassword !== null) {

        }

        if (Yii::$app->user->identity->validate() && Yii::$app->user->identity->save()) {
            return [
                'success' => true,
            ];
        } else {
            return [
                'errors' => Yii::$app->user->identity->getErrors()
            ];
        }
        return [];
    }

}
