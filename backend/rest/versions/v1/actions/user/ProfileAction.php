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
        $firstname = Yii::$app->getRequest()
                              ->getBodyParam('firstname', null);
        $lastname = Yii::$app->getRequest()
                             ->getBodyParam('lastname', null);


        $this->updateEmail($newEmail);
        $this->updatePassword($oldPassword, $newPassword);
        $this->updateNames($firstname, $lastname);

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

    private function updateEmail($newEmail)
    {
        if ($newEmail !== null && $newEmail != Yii::$app->user->identity->email) {
            Yii::$app->user->identity->email = $newEmail;
            Yii::$app->user->identity->save();
            Yii::$app->user->identity->refresh();
            // @TODO send confirmation email
            return true;
        }
    }

    private function updatePassword($oldPassword, $newPassword)
    {
        if ($oldPassword != $newPassword) {
            // @TODO step 1, check if old password is correct

            // @TODO step 2, check if new password is complex enough

            // @TODO step 3, update with new password
        }
    }

    private function updateNames($firstname, $lastname)
    {
        if ($firstname != null) {
            Yii::$app->user->identity->firstname = $firstname;
        }
        if ($lastname != null) {
            Yii::$app->user->identity->lastname = $lastname;
        }
        if ($firstname !== null || $lastname !== null) {
            Yii::$app->user->identity->save();
        }
    }

}
