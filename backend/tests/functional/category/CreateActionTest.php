<?php

namespace tests\functional\category;


use tests\functional\FunctionalTestCase;
use yii\web\ServerErrorHttpException;
use yii\web\UnauthorizedHttpException;

class CreateActionTest extends FunctionalTestCase
{
    protected function setUp()
    {
        parent::setUp();
        $this->loginAsUser($this->baseUser->id);
    }

    public function testCanCreateCategory()
    {
        $result = $this->apiCall('v1/categories', 'POST', [
            'name' => $this->faker->text(50),
        ]);
        $this->assertTrue(
            $this->lastApiCallHttpResponseCode >= 200 && $this->lastApiCallHttpResponseCode < 300,
            'Category creation did not return a proper success HTTP code'
        );
        $this->assertEquals($this->baseUser->id, $result['owner_id'],
            'Category created but owner ID is not the creating user');
    }

    public function testCanNotCreateCategoryWithEmptyName()
    {
        $this->expectException(ServerErrorHttpException::class);
        $this->apiCall('v1/categories', 'POST', ['name' => null]);
    }

    public function testCanNotCreateCategoryAnonymously()
    {
        $this->logout();
        $this->expectException(UnauthorizedHttpException::class);
        $this->apiCall('v1/categories', 'POST', [
            'name' => $this->faker->text(20)
        ]);
    }

    public function testCanNotOverwriteCategoryOwner()
    {
        $stranger = $this->createUser();
        $result = $this->apiCall('v1/categories', 'POST', [
            'name' => $this->faker->text(50),
            // Try to create a category with an owner != me
            'owner_id' => $stranger->id,
        ]);
        $this->assertEquals($this->baseUser->id, $result['owner_id'],
            'Potential security issue. Can create categories and assign them to other people');

        // Cleanup
        $this->deleteUser($stranger->id);
    }

    public function testCreateCategoryNameMatches()
    {
        $CATEGORY_NAME = $this->faker->text(50);

        $result = $this->apiCall('v1/categories', 'POST', [
            'name' => $CATEGORY_NAME,
        ]);
        $this->assertEquals(
            $CATEGORY_NAME,
            $result['name'],
            'Category created with a random name but the API responded with a different name. Possible MySQL encoding issue'
        );
    }

    public function testCreateCategoryDescriptionMatches()
    {
        $CATEGORY_NAME = $this->faker->text(50);
        $CATEGORY_DESCRIPTION = $this->faker->text(50);

        $result = $this->apiCall('v1/categories', 'POST', [
            'name' => $CATEGORY_NAME,
            'description' => $CATEGORY_DESCRIPTION,
        ]);
        $this->assertEquals(
            $CATEGORY_DESCRIPTION,
            $result['description'],
            'Category created with a random description but the API responded with a different description. Possible MySQL encoding issue'
        );
    }

}