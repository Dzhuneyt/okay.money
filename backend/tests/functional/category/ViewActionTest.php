<?php

namespace tests\functional\category;


use common\models\Category;
use tests\functional\FunctionalTestCase;
use yii\web\ForbiddenHttpException;
use yii\web\UnauthorizedHttpException;

class ViewActionTest extends FunctionalTestCase
{

    /**
     * @var Category
     */
    private $category;

    public function setUp()
    {
        parent::setUp();
        $this->loginAsUser($this->baseUser->id);
        $this->category = $this->createCategory($this->baseUser->id);
    }

    public function testCanViewMyCategory()
    {
        $result = $this->apiCall('v1/categories/' . $this->category->id, 'GET');
        $this->assertNotNull($result);
        $this->assertEquals(200, $this->lastApiCallHttpResponseCode);
    }

    public function testCanNotViewOtherPeopleCategories()
    {
        $stranger = $this->createUser();
        $categoryOfStranger = $this->createCategory($stranger->id);

        $this->expectException(ForbiddenHttpException::class);
        $response = $this->apiCall(
            'v1/categories/' . $categoryOfStranger->id,
            'GET'
        );
    }

    public function testCanNotViewCategoriesAnonymously()
    {
        $this->logout();

        $this->expectException(UnauthorizedHttpException::class);
        $this->apiCall('v1/categories/' . $this->category->id, 'GET');
    }

    public function testPreflight()
    {
        $this->assertPreflightrequest('v1/categories/' . $this->category->id);
    }

}
