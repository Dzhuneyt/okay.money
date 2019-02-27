<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 2/27/19
 * Time: 1:21 PM
 */

namespace tests\helpers;


class Curl extends \linslin\yii2\curl\Curl
{

    /**
     * @param $url
     * @param bool $raw
     * @return mixed
     * @throws \Exception
     */
    public function options($url, $raw = true)
    {
        $this->_baseUrl = $url;
        return $this->_httpRequest('OPTIONS', $raw);
    }

}
