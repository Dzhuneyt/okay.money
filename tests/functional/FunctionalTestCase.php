<?php

namespace tests\functional;

use linslin\yii2\curl\Curl;
use PHPUnit\Framework\TestCase;
use yii\base\Exception;
use yii\helpers\Json;
use yii\web\NotFoundHttpException;
use yii\web\ServerErrorHttpException;
use yii\web\UnauthorizedHttpException;

class FunctionalTestCase extends TestCase
{
    private $baseUrl = 'http://localhost:8080/';
    private $accessToken;

    /**
     * @param $path
     * @param string $method
     * @param array $params
     * @throws Exception
     */
    protected function apiCall($path, $method = 'GET', $params = [])
    {
        $curl = new Curl();
        $curl->setHeader('Accept', 'application/json');

        if ($this->accessToken) {
            $curl->setGetParams(['access-token' => $this->accessToken]);
        }

        $url = $this->baseUrl . $path;
        switch ($method) {
            case 'GET':
                $curl->setGetParams($params);
                $response = $curl->get($url);
                break;
            case 'POST':
                $curl->setPostParams($params);
                $response = $curl->post($url);
                break;
            default:
                throw new Exception('HTTP method not implemented for API call');
        }

        try {
            $response = Json::decode($response, true);
        } catch (Exception $e) {
            \Yii::error("Can not parse JSON response from API");
            throw $e;
        }

        // List of status codes here http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
        switch ($curl->responseCode) {

            case 'timeout':
                //timeout error logic here
                throw new Exception('API call resulted in timeout:' . $path);
            case 200:
            case 201:
                //success logic here
                return $response;
            case 401:
                throw new UnauthorizedHttpException('Attempting to call an authenticated API with no token: ' . $method . " " . $url);
                break;
            case 404:
                //404 Error logic here
                throw new NotFoundHttpException("URL not found:" . $path);
            case 422:
                \Yii::error($response);
                throw new ServerErrorHttpException('Model validation failed - error 422: ' . print_r($response, true));
            case 500:
                \Yii::error($response);
                throw new ServerErrorHttpException('API call during test threw 500 Internal Server Error');
            default:
                \Yii::error('Test error');
                \Yii::error($curl->responseCode);
                \Yii::error($response);
                throw new ServerErrorHttpException('API call during test resulted in an unknown error code:' . print_r($curl->responseCode,
                        1));
                break;
        }
    }

    protected function loginAsAnonymous()
    {
        $this->accessToken = null;
    }

    protected function loginAsUser()
    {
        $accessToken = $this->apiCall('v1/user/login', 'POST', [
            'username' => 'demo',
            'password' => 'demo',
        ]);
        $this->accessToken = $accessToken;
    }
}