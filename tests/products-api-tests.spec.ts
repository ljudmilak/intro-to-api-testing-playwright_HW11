import { expect, test } from '@playwright/test'

import { StatusCodes } from 'http-status-codes'

test.describe('Lesson 11 -> Product API tests', () => {
  const BaseEndpointURL = 'https://backend.tallinn-learning.ee/products'
  const AUTH = { 'X-API-Key': 'my-secret-api-key' }
  type Product = {
    id: number
    name: string
    price: number
    createdAt: string | null
  }
  type CreateProductDTO = {
    name: string
    price: number
  }

  type UpdateProductDTO = {
    name?: string
    price?: number
  }

  test('GET /products - check API returns array with length >= 1', async ({ request }) => {
    const response = await request.get(BaseEndpointURL, {
      headers: AUTH,
    })

    const responseBody: Product[] = await response.json()
    expect(response.status()).toBe(StatusCodes.OK)
    expect(responseBody.length).toBeDefined()
    expect(responseBody.length).toBeGreaterThanOrEqual(1)
  })

  test('POST /products; GET /products/{id} - check product creation and product search by id', async ({
    request,
  }) => {
    const testProduct: CreateProductDTO = {
      name: 'test lesson 11',
      price: 124523643,
    }

    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProduct,
    })

    const createResponseBody: Product = await createResponse.json()
    expect(createResponseBody.id).toBeGreaterThan(0)
    expect(createResponseBody.name).toBe(testProduct.name)
    expect(createResponseBody.price).toBe(testProduct.price)
    expect(createResponseBody.createdAt).toBeDefined()

    const searchResponse = await request.get(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
    })
    const searchResponseBody: Product = await searchResponse.json()
    expect(searchResponse.status()).toBe(StatusCodes.OK)
    expect.soft(searchResponseBody.id).toBe(createResponseBody.id)
    expect.soft(searchResponseBody.name).toBe(testProduct.name)
    expect.soft(searchResponseBody.price).toBe(testProduct.price)
    expect.soft(searchResponseBody.createdAt).toBeDefined()
  })

  test('DELETE /products - check not existing product deletion', async ({ request }) => {
    const deleteResponse = await request.delete(`${BaseEndpointURL}/-1`, {
      headers: AUTH,
    })

    expect(deleteResponse.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('DELETE /products - check product deletion', async ({ request }) => {
    const testProduct: CreateProductDTO = {
      name: 'test lesson 11',
      price: 124523643,
    }

    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProduct,
    })
    const createResponseBody: Product = await createResponse.json()

    const deleteResponse = await request.delete(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
    })

    expect(deleteResponse.status()).toBe(StatusCodes.NO_CONTENT)
  })

  test('PUT /products/{id}; GET /products/{id} - check product update and verify with GET', async ({
    request,
  }) => {
    const testProduct: CreateProductDTO = {
      name: 'first name',
      price: 123456,
    }

    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProduct,
    })

    const createdProduct: Product = await createResponse.json()
    const updatedData: UpdateProductDTO = {
      name: 'updated name',
      price: 789012,
    }

    const updateResponse = await request.put(`${BaseEndpointURL}/${createdProduct.id}`, {
      headers: AUTH,
      data: updatedData,
    })

    expect(updateResponse.status()).toBe(StatusCodes.OK)

    const getResponse = await request.get(`${BaseEndpointURL}/${createdProduct.id}`, {
      headers: AUTH,
    })

    expect(getResponse.status()).toBe(StatusCodes.OK)

    const updatedProduct: Product = await getResponse.json()

    expect.soft(updatedProduct.name).toBe(updatedData.name)
    expect.soft(updatedProduct.price).toBe(updatedData.price)
  })

  test('GET /product/{id} - invalid Api Key returns status 401', async ({ request }) => {
    const response = await request.get(`${BaseEndpointURL}/1`, {
      headers: { 'X-API-Key': 'invalid-api-key' },
    })

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('GET /product/{id} - non existing product returns status 400', async ({ request }) => {
    const response = await request.get(`${BaseEndpointURL}/989879787`, {
      headers: AUTH,
    })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })
})
