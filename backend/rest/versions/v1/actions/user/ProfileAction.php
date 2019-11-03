<?php

namespace rest\versions\v1\actions\user;

use common\models\Login;
use common\models\User;
use Yii;
use yii\rest\Action;
use yii\web\HttpException;



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
        $this->updateFirstnameLastname($firstname, $lastname);

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
        $oldEmail = Yii::$app->user->identity->email;
        if ($newEmail !== null && $newEmail != $oldEmail) {
            Yii::info('Email is being changed from ' . $oldEmail . ' to ' . $newEmail . '. Sending confirmations');
            Yii::$app->user->identity->email = $newEmail;
            if (!Yii::$app->user->identity->save()) {
                Yii::error(Yii::$app->user->getErrors());
                throw new HttpException(400, 'Can not save email due to an internal error');
            }
            Yii::$app->user->identity->refresh();
            // @TODO send confirmation email

            Yii::$app->mailer->compose()
                             ->setFrom(getenv('PLATFORM_OWNER_EMAIL'))
                             ->setTo($oldEmail)
                             ->setSubject('Your account email has changed')
                             ->setTextBody('You have recently changed your account email from ' . $oldEmail . ' to ' . $newEmail . '. This message is just to confirm that this change happened. No further action is needed on your side. If you did not do this change, please contact us immediately.')
                             ->send();
            Yii::$app->mailer->compose()
                             ->setFrom(getenv('PLATFORM_OWNER_EMAIL'))
                             ->setTo($newEmail)
                             ->setSubject('Your account email has changed')
                             ->setTextBody('You have recently changed your account email from ' . $oldEmail . ' to ' . $newEmail . '. This message is just to confirm that this change happened. No further action is needed on your side. If you did not do this change, please contact us immediately.')
                             ->send();
            return true;
        }
        Yii::info('Email not changed');
    }

    private function updatePassword($oldPassword, $newPassword)
    {
        if (empty($oldPassword) || empty($newPassword)) {
            return;
        }

        if (!Yii::$app->user->identity->validatePassword($oldPassword)) {
            throw new HttpException(400, 'Your current password is not correct');
        }

        if ($oldPassword === $newPassword) {
            throw new HttpException(400, 'Old and new password can not be the same');
        }

        // Check if new password is complex enough
        if (strlen($newPassword) < 6) {
            throw new HttpException(400, 'Password is too simple. Must be more than 6 characters');
        }

        // Old password is correct, set new password
        Yii::$app->user->identity->setPassword($newPassword);
        if (!Yii::$app->user->identity->save()) {
            Yii::error(Yii::$app->user->getErrors());
            throw new HttpException(400, 'Can not save new password');
        }
        Yii::$app->user->identity->refresh();
    }

    private function updateFirstnameLastname($firstname, $lastname)
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
