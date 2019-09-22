<?php

namespace tests\functional\category;


use common\models\Category;
use tests\functional\FunctionalTestCase;

class IndexActionTest extends FunctionalTestCase
{
    protected function setUp()
    {
        parent::setUp();
        $this->loginAsUser($this->baseUser->id);

        // Initial cleanup
        Category::deleteAll();
    }

    public function testCanListMyCategories()
    {
        $categories = [];
        for ($i = 0; $i < 5; $i++) {
            $categories[] = $this->createCategory($this->baseUser->id);
        }

        $response = $this->apiCall('v1/categories', 'GET');

        $this->assertEquals(
            5,
            count($response['items']),
            'API for listing categories listed more categories than I have'
        );
    }

    public function testCanNotListOtherPeopleCategories()
    {
        $stranger = $this->createUser();
        $categoryOfStranger = $this->createCategory($stranger->id);
        $myCategory = $this->createCategory($this->baseUser->id);

        $response = $this->apiCall('v1/categories', 'GET');

        $this->assertEquals(
            $myCategory->id,
            $response['items'][0]['id'],
            'API for listing categories listed other peoples categories'
        );

        $this->assertEquals(
            1,
            count($response['items']),
            'API for listing categories listed other peoples categories'
        );

        $this->deleteUser($stranger->id); // Cleanup
    }

    public function testPreflight()
    {
        $this->assertPreflightrequest('v1/categories');
    }

}
